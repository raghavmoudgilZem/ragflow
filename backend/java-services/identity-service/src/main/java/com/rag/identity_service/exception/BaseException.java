package com.rag.identity_service.exception;

class BaseException extends RuntimeException {
    private final String code;

    public BaseException(String code, String msg) {
        super(msg);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}