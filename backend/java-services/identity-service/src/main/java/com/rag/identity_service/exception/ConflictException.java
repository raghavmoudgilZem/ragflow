package com.rag.identity_service.exception;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}