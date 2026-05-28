package com.ueims.security;

import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    // TODO: Implement JWT generation and validation logic here
    public String generateToken(String username) {
        return "mock-jwt-token";
    }
    
    public boolean validateToken(String token) {
        return true;
    }
}
