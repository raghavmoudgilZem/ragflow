package com.ragflow.document.exception;

import lombok.Getter;

@Getter
public class IdempotencyConflictException extends RuntimeException {
    private final String key;

    public IdempotencyConflictException(String message) {
        super(String.format("Try using a key other than '%s' if you meant to execute a different request.", message));
        this.key = message;
    }

}
