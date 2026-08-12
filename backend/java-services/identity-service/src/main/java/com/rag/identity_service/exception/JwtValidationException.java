package com.rag.identity_service.exception;

public class JwtValidationException extends RuntimeException {
    public JwtValidationException(String message) { super(message); }
}