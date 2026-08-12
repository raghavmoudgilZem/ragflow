package com.ragflow.llmgateway.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when a requested resource does not exist. Maps to HTTP 404.
 */
public class ResourceNotFoundException extends ApplicationException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
