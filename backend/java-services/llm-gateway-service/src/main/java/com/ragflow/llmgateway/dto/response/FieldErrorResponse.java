package com.ragflow.llmgateway.dto.response;

/**
 * A single field-level validation failure, returned as part of {@link com.ragflow.llmgateway.dto.ApiResponse#data()}
 * when a request fails Bean Validation.
 */
public record FieldErrorResponse(String field, String message) {
}
