package com.ueims.config.websocket;

import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * STOMP-over-WebSocket config used to push real-time updates (e.g. request logs)
 * to admin clients. Frontend connects via SockJS at /ws and subscribes to
 * /topic/request-logs.
 *
 * Auth: JWT is passed via the standard "Authorization: Bearer ..." STOMP
 * header. We also accept a `?token=...` query parameter during the SockJS
 * handshake because browsers cannot set custom headers on the WS upgrade
 * request.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtDecoder jwtDecoder;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new JwtHandshakeInterceptor(jwtDecoder))
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null || accessor.getCommand() == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            Jwt jwt = jwtDecoder.decode(token);
                            JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
                            authoritiesConverter.setAuthorityPrefix("");
                            authoritiesConverter.setAuthoritiesClaimName("authorities");
                            JwtAuthenticationConverter authConverter = new JwtAuthenticationConverter();
                            authConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
                            Authentication authentication = authConverter.convert(jwt);
                            if (authentication != null) {
                                accessor.setUser(authentication);
                            }
                        } catch (Exception e) {
                            log.debug("WebSocket CONNECT rejected: {}", e.getMessage());
                            throw new org.springframework.security.access.AccessDeniedException(
                                    "Invalid JWT for WebSocket connection");
                        }
                    } else {
                        throw new org.springframework.security.access.AccessDeniedException(
                                "Missing JWT for WebSocket connection");
                    }
                }

                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    if (destination != null
                            && (destination.startsWith("/topic/admin")
                                    || destination.startsWith("/topic/request-logs"))) {
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        if (accessor.getUser() instanceof Authentication stompAuth) {
                            auth = stompAuth;
                        }
                        if (auth == null
                                || auth.getAuthorities().stream()
                                        .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                                                || a.getAuthority().equals("ROLE_SYSTEM_ADMIN"))) {
                            throw new org.springframework.security.access.AccessDeniedException(
                                    "Admin role required for " + destination);
                        }
                    }
                }

                return message;
            }
        });
    }

    /**
     * Allow SockJS clients (which can't set custom headers on the WS upgrade
     * request) to authenticate by passing ?token=... on the handshake URL.
     * On success, the validated JWT is forwarded to the STOMP layer as a
     * native Authorization header.
     */
    static class JwtHandshakeInterceptor implements HandshakeInterceptor {

        private final JwtDecoder jwtDecoder;

        JwtHandshakeInterceptor(JwtDecoder jwtDecoder) {
            this.jwtDecoder = jwtDecoder;
        }

        @Override
        public boolean beforeHandshake(
                @NonNull ServerHttpRequest request,
                @NonNull ServerHttpResponse response,
                @NonNull WebSocketHandler wsHandler,
                @NonNull Map<String, Object> attributes) {
            String token = extractToken(request);
            if (token == null) {
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            try {
                jwtDecoder.decode(token);
            } catch (Exception e) {
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            attributes.put("Authorization", "Bearer " + token);
            return true;
        }

        @Override
        public void afterHandshake(
                @NonNull ServerHttpRequest request,
                @NonNull ServerHttpResponse response,
                @NonNull WebSocketHandler wsHandler,
                Exception exception) {}

        private String extractToken(ServerHttpRequest request) {
            String auth = request.getHeaders().getFirst("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                return auth.substring(7);
            }
            if (request instanceof ServletServerHttpRequest servletRequest) {
                String queryToken = servletRequest.getServletRequest().getParameter("token");
                if (queryToken != null && !queryToken.isBlank()) {
                    return queryToken;
                }
            }
            return null;
        }
    }

    @SuppressWarnings("unused")
    private static SimpleGrantedAuthority _role(String name) {
        return new SimpleGrantedAuthority(name);
    }

    @SuppressWarnings("unused")
    private static UsernamePasswordAuthenticationToken _auth() {
        return new UsernamePasswordAuthenticationToken("", "");
    }
}
