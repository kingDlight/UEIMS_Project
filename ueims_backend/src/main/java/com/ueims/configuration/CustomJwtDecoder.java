package com.ueims.configuration;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
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
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            com.nimbusds.jwt.SignedJWT signedJWT = com.nimbusds.jwt.SignedJWT.parse(token);
            String jit = signedJWT.getJWTClaimsSet().getJWTID();
            if (jit != null && invalidatedTokenRepository.existsById(jit)) {
                throw new JwtException("Token is invalidated");
            }

            if (jit != null) {
                UserSession session = userSessionRepository
                        .findById(jit)
                        .orElseThrow(() -> new JwtException("Session not found or invalidated by another login"));

                if (session.getLastActivity().plusMinutes(15).isBefore(LocalDateTime.now())) {
                    invalidatedTokenRepository.save(InvalidatedToken.builder()
                            .tokenId(session.getTokenId())
                            .expiresAt(session.getExpiresAt())
                            .build());
                    userSessionRepository.delete(session);
                    throw new JwtException("Token expired due to inactivity");
                }

                session.setLastActivity(LocalDateTime.now());
                userSessionRepository.save(session);
            }

        } catch (ParseException e) {
            throw new JwtException("Invalid token format", e);
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
