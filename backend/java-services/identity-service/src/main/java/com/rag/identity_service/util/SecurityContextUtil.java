package com.rag.identity_service.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

public class SecurityContextUtil {

    private SecurityContextUtil() {
    }

    public static Map<String, Object> getAllClaims() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getDetails() instanceof Map<?, ?> claims) {
            @SuppressWarnings("unchecked")
            Map<String, Object> castedClaims = (Map<String, Object>) claims;
            return castedClaims;
        }
        return Collections.emptyMap();
    }

    public static <T> Optional<T> getClaim(String key, Class<T> type) {
        var value = getAllClaims().get(key);
        if (type.isInstance(value)) {
            return Optional.of(type.cast(value));
        }
        return Optional.empty();
    }

    public static Optional<String> getSubject() {
        return getClaim(Constants.CLAIM_SUB, String.class);
    }

    public static Optional<String> getEmail() {
        return getClaim(Constants.CLAIM_EMAIL, String.class);
    }

    public static Optional<String> getTenantId() {
        return getClaim(Constants.CLAIM_TENANT_ID, String.class);
    }

    public static Optional<String> getCallerRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null || authentication.getAuthorities().isEmpty()) {
            return Optional.empty();
        }
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        if (role == null || role.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(role);
    }
}