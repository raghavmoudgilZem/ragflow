package com.ragflow.file.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
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