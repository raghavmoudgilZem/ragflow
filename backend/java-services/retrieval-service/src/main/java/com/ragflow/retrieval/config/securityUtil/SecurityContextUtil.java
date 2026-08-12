package com.ragflow.retrieval.config.securityUtil;

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
        return getClaim("sub", String.class);
    }

    public static Optional<String> getEmail() {
        return getClaim("email", String.class);
    }

    public static Optional<String> getTenantId() {
        return getClaim("tenantId", String.class);
    }
}
