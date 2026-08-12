package com.ragflow.retrieval.config;

import com.ragflow.retrieval.config.securityUtil.JwtValidationException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {
    private static final String SECRET = "super-secret-key-that-must-be-at-least-32-bytes-long!";
    private JwtService jwtService;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET);
        key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void validateAndParse_ValidToken_ReturnsClaims() {
        String token = Jwts.builder()
                .subject("user123")
                .claims(Map.of("tenantId", "tenant-abc"))
                .signWith(key)
                .compact();

        Map<String, Object> claims = jwtService.validateAndParse(token);

        assertNotNull(claims);
        assertEquals("user123", claims.get("sub"));
        assertEquals("tenant-abc", claims.get("tenantId"));
    }

    @Test
    void validateAndParse_ExpiredToken_ThrowsJwtValidationException() {
        String token = Jwts.builder()
                .subject("user123")
                .expiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(key)
                .compact();

        JwtValidationException exception = assertThrows(
                JwtValidationException.class,
                () -> jwtService.validateAndParse(token)
        );
        assertEquals("Token expired", exception.getMessage());
    }

    @Test
    void validateAndParse_TamperedSignature_ThrowsJwtValidationException() {
        String token = Jwts.builder()
                .subject("user123")
                .signWith(key)
                .compact();

        String tamperedToken = token + "corrupted";

        JwtValidationException exception = assertThrows(
                JwtValidationException.class,
                () -> jwtService.validateAndParse(tamperedToken)
        );
        assertEquals("Invalid token", exception.getMessage());
    }
}
