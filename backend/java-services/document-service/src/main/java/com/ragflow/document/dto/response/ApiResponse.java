package com.ragflow.document.dto.response;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public record ApiResponse<T>(
        int code,
        String message,
        T data
) {

    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        ApiResponse<T> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "success",
                data
        );
        return ResponseEntity.ok(response);
    }
    public static <T> ResponseEntity<ApiResponse<T>> success(T data, HttpHeaders headers){
        ApiResponse<T> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "success",
                data
        );
        return ResponseEntity.ok().headers(headers).body(response);
    }

    public static <T> ResponseEntity<ApiResponse<T>> success() {
        return success(null);
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message) {
        ApiResponse<T> response = new ApiResponse<>(
                status.value(),
                message,
                null
        );
        return ResponseEntity.status(status).body(response);
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message, T data) {
        ApiResponse<T> response = new ApiResponse<>(
                status.value(),
                message,
                data
        );
        return ResponseEntity.status(status).body(response);
    }
}
