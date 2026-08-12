package com.rag.notification.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApiResponse<T>(
        boolean success,
        @JsonProperty("status_code") int statusCode,
        String error,
        T data
) {
    public static <T> ApiResponse<T> success(int statusCode, T data) {
        return new ApiResponse<>(true, statusCode, null, data);
    }

    public static <T> ApiResponse<T> error(int statusCode, String error) {
        return new ApiResponse<>(false, statusCode, error, null);
    }
}