package com.ragflow.retrieval.exception;

/**
 * Thrown when the re-rank model provider cannot be reached or its response
 * cannot be used: connection refused, timeout, non-2xx status, empty or
 * unparseable body, or a missing score.
 *
 * <p>Unlike most exceptions in this service, this one never reaches the client
 * and is never mapped to an HTTP status. {@code RerankService} catches it and
 * returns the un-re-ranked results instead, so a broken re-rank provider
 * degrades result ordering rather than failing the user's search. That is why it
 * does not extend {@code BusinessException} or carry an {@code ErrorCode} —
 * those exist to build error responses, and this exception must never produce
 * one.
 */
public class RerankClientException extends RuntimeException {

    public RerankClientException(String message) {
        super(message);
    }

    public RerankClientException(String message, Throwable cause) {
        super(message, cause);
    }
}
