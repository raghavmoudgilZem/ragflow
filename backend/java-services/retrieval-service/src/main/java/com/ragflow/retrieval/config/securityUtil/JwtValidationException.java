package com.ragflow.retrieval.config.securityUtil;

public class JwtValidationException extends RuntimeException {
    public JwtValidationException(String message) {
        super(message);
    }
}