package com.ueims.configuration;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.ueims.model.entity.InvalidatedToken;
import com.ueims.model.entity.UserSession;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.repository.UserSessionRepository;

@Component
@lombok.RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final UserSessionRepository userSessionRepository;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            com.nimbusds.jwt.SignedJWT signedJWT = com.nimbusds.jwt.SignedJWT.parse(token);

            String tokenType = signedJWT.getJWTClaimsSet().getStringClaim("token_type");
            if (!"ACCESS".equals(tokenType)) {
                throw new BadJwtException("Invalid token type");
            }

            String jit = signedJWT.getJWTClaimsSet().getJWTID();
            if (jit != null && invalidatedTokenRepository.existsById(jit)) {
                throw new BadJwtException("Token has been invalidated");
            }

            if (jit != null) {
                var sessionOpt = userSessionRepository.findById(jit);
                if (sessionOpt.isEmpty()) {
                    throw new BadJwtException("Session not found or expired");
                }

                UserSession session = sessionOpt.get();

                if (session.getLastActivity() != null
                        && session.getLastActivity().plusMinutes(15).isBefore(LocalDateTime.now())) {
                    invalidatedTokenRepository.save(InvalidatedToken.builder()
                            .tokenId(session.getTokenId())
                            .expiresAt(session.getExpiresAt())
                            .build());
                    userSessionRepository.delete(session);
                    throw new BadJwtException("Session expired due to inactivity");
                }

                session.setLastActivity(LocalDateTime.now());
                userSessionRepository.save(session);
            }

        } catch (ParseException e) {
            throw new BadJwtException("Invalid token format", e);
        }

        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }
}
