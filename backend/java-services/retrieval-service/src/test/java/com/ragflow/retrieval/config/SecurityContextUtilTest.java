package com.ragflow.retrieval.config.securityUtil;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SecurityContextUtilTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllClaims_EmptyContext_ReturnsEmptyMap() {
        Map<String, Object> claims = SecurityContextUtil.getAllClaims();
        assertNotNull(claims);
        assertTrue(claims.isEmpty());
    }

    @Test
    void getClaims_ValidContext_ReturnsCorrectFields() {
        Map<String, Object> testClaims = Map.of(
                "sub", "user-id-99",
                "email", "test@ragflow.com",
                "tenantId", "tenant-id-77"
        );

        var auth = new UsernamePasswordAuthenticationToken("user-id-99", null, Collections.emptyList());
        auth.setDetails(testClaims);
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertTrue(SecurityContextUtil.getSubject().isPresent());
        assertEquals("user-id-99", SecurityContextUtil.getSubject().orElseThrow());

        assertTrue(SecurityContextUtil.getEmail().isPresent());
        assertEquals("test@ragflow.com", SecurityContextUtil.getEmail().orElseThrow());

        assertTrue(SecurityContextUtil.getTenantId().isPresent());
        assertEquals("tenant-id-77", SecurityContextUtil.getTenantId().orElseThrow());
        assertEquals(testClaims, SecurityContextUtil.getAllClaims());
    }

    @Test
    void getClaim_TypeMismatch_ReturnsEmptyOptional() {
        Map<String, Object> testClaims = Map.of("exp", 123456789L);
        var auth = new UsernamePasswordAuthenticationToken("user", null, Collections.emptyList());
        auth.setDetails(testClaims);
        SecurityContextHolder.getContext().setAuthentication(auth);

        var claimOptional = SecurityContextUtil.getClaim("exp", String.class);
        assertTrue(claimOptional.isEmpty());
    }
}