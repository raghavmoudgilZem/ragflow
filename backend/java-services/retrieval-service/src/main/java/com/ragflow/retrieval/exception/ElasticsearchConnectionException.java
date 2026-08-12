package com.ragflow.retrieval.exception;

public class ElasticsearchConnectionException extends RuntimeException{
    public ElasticsearchConnectionException(String message, Throwable cause) {
        super(message, cause);
    }

    public ElasticsearchConnectionException(String message) {
        super(message);
    }
}
