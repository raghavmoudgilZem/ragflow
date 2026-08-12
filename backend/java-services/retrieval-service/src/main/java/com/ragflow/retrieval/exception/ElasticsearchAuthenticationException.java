package com.ragflow.retrieval.exception;

public class ElasticsearchAuthenticationException extends RuntimeException{
    public ElasticsearchAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
