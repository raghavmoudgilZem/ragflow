package com.ragflow.llmgateway.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base type for all domain exceptions raised by this service. Each subtype pins the HTTP status
 * it maps to, so {@code GlobalExceptionHandler} can translate any {@code ApplicationException}
 * into a response without a type-by-type switch.
 */
@Getter
public abstract class ApplicationException extends RuntimeException {

    private final HttpStatus status;

    protected ApplicationException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
