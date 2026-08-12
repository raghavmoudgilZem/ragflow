package com.rag.identity_service.config;

import com.rag.identity_service.exception.JwtValidationException;
import com.rag.identity_service.util.Constants;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final String roleClaimKey;

    public JwtService(SecurityProperties properties) {
        this.signingKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.roleClaimKey = properties.getRoleClaimKey();
    }

    public String generateToken(String userId, String email, String tenantId, String role) {
        log.info("JWT generation process initiated for subject payload: {}", email);
        long nowMillis = System.currentTimeMillis();

        Map<String, Object> claims = new HashMap<>();
        claims.put(Constants.CLAIM_SUB, userId);
        claims.put(Constants.CLAIM_EMAIL, email);
        claims.put(Constants.CLAIM_TENANT_ID, tenantId);
        claims.put(roleClaimKey, role);
        claims.put(Constants.CLAIM_STATUS, "Active");
        claims.put(Constants.CLAIM_FRESH, "true");
        claims.put(Constants.CLAIM_ISS, "java/ragflow.identity");
        claims.put(Constants.CLAIM_AUD, "java/ragflow.api");

        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date(nowMillis))
                .expiration(new Date(nowMillis + 86400000))
                .signWith(signingKey)
                .compact();
    }

    public Map<String, Object> validateAndParse(String token) {
        try {
            log.info("JWT token verification starts");
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.error("JWT validation breakdown: Provided token session lifecycle expired", e);
            throw new JwtValidationException("Token expired");
        } catch (JwtException | IllegalArgumentException e) {
            log.error("JWT validation breakdown: Signature payload structurally altered or invalid", e);
            throw new JwtValidationException("Invalid token");
        }
    }
}