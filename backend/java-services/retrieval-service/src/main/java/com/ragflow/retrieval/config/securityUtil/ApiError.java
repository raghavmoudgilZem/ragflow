package com.ragflow.retrieval.config.securityUtil;

import java.time.Instant;

public record ApiError(int code, String message, String timestamp) {
    public static ApiError of(int code, String message) {
        return new ApiError(code, message, Instant.now().toString());
    }
}