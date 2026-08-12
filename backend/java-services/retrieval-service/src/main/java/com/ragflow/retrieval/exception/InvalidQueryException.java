package com.ragflow.retrieval.exception;

/**
 * Thrown by {@link com.ragflow.retrieval.service.QuerySanitizer} when raw
 * query text fails validation (null, or empty after trimming).
 * <p>
 * Unchecked, so it doesn't need to be declared on every method signature up
 * the call chain — caught centrally by {@link GlobalExceptionHandler} and
 * mapped to HTTP 400.
 */
public class InvalidQueryException extends RuntimeException {
    public InvalidQueryException(String message) {
        super(message);
    }
}