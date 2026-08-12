package com.ragflow.retrieval.exception;

/**
 * Thrown when the RagFlow hybrid search pipeline (embedding generation,
 * Elasticsearch query execution, or response mapping) fails.
 */
public class SearchExecutionException extends RuntimeException {

    public SearchExecutionException(String message, Throwable cause) {
        super(message, cause);
    }

    public SearchExecutionException(String message) {
        super(message);
    }
}
