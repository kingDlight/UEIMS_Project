package com.ueims.config.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final String[] PUBLIC_ENDPOINTS = {
        "/api/auth/token",
        "/api/auth/introspect",
        "/api/auth/logout",
        "/api/auth/refresh",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/register-enterprise",
        "/api/auth/google",
        "/api/test/**"
    };

    private static final String[] PUBLIC_GET_ENDPOINTS = {"/uploads/**", "/api/public/**"};

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity httpSecurity,
            CustomJwtDecoder customJwtDecoder,
            RequirePasswordChangeFilter requirePasswordChangeFilter,
            RateLimitFilter rateLimitFilter,
            SecurityHeadersFilter securityHeadersFilter)
            throws Exception {
        httpSecurity.authorizeHttpRequests(request -> request.requestMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()
                .requestMatchers(HttpMethod.GET, "/google-login-test.html")
                .permitAll()
                .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS)
                .permitAll()
                .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS)
                .permitAll()
                .anyRequest()
                .authenticated());

        httpSecurity.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer
                        .decoder(customJwtDecoder)
                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .bearerTokenResolver(publicSkippingBearerTokenResolver())
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));
        // CSRF protection is intentionally disabled: this is a stateless REST API that uses
        // JWT Bearer tokens transmitted via the Authorization header (not cookies). Since tokens
        // are never stored in cookies, cross-site requests cannot carry them automatically, making
        // CSRF attacks impossible. This is consistent with OWASP recommendations for stateless APIs.
        // SonarQube S4502: acknowledged — CSRF does not apply to Bearer-token-based REST APIs.
        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        httpSecurity.cors(cors -> {});

        // Security headers on every response
        httpSecurity.addFilterBefore(securityHeadersFilter, UsernamePasswordAuthenticationFilter.class);
        // Rate limiting before JWT processing
        httpSecurity.addFilterBefore(rateLimitFilter, BearerTokenAuthenticationFilter.class);
        // Enforce password change after JWT validation
        httpSecurity.addFilterAfter(requirePasswordChangeFilter, BearerTokenAuthenticationFilter.class);

        return httpSecurity.build();
    }

    /**
     * A BearerTokenResolver that returns null (no token) for public endpoints,
     * preventing the BearerTokenAuthenticationFilter from attempting JWT validation
     * on paths that are already permitted (e.g., /api/auth/token). This avoids
     * a 401 caused by a stale/invalidated token sent in the Authorization header
     * to a public endpoint.
     */
    @Bean
    public BearerTokenResolver publicSkippingBearerTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        AntPathMatcher matcher = new AntPathMatcher();
        List<String> publicPaths = Arrays.asList(PUBLIC_ENDPOINTS);
        List<String> publicGetPaths = Arrays.asList(PUBLIC_GET_ENDPOINTS);

        return request -> {
            String path = request.getRequestURI();
            String method = request.getMethod();

            // Skip token extraction for public endpoints
            boolean isPublicPost =
                    "POST".equalsIgnoreCase(method) && publicPaths.stream().anyMatch(p -> matcher.match(p, path));
            boolean isPublicGet =
                    "GET".equalsIgnoreCase(method) && publicGetPaths.stream().anyMatch(p -> matcher.match(p, path));
            boolean isPublicLogin = "GET".equalsIgnoreCase(method) && "/google-login-test.html".equals(path);

            if (isPublicPost || isPublicGet || isPublicLogin) {
                return null; // No token → no JWT validation → request flows to permitAll
            }
            return delegate.resolve(request);
        };
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.addAllowedOriginPattern("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("authorities");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
