package com.ragflow.llmgateway.dto;

import java.time.Instant;

/**
 * Standard response envelope returned by every controller in this service.
 */
public record ApiResponse<T>(
        boolean success,
        int statusCode,
        String message,
        String error,
        T data,
        Instant timestamp
) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, 200, "Success", null, data, Instant.now());
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(true, 201, "Created", null, data, Instant.now());
    }

    public static <T> ApiResponse<T> error(int statusCode, String message) {
        return new ApiResponse<>(false, statusCode, null, message, null, Instant.now());
    }
}
