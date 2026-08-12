package com.ragflow.retrieval.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    SEARCH_CONFIGURATION_NOT_FOUND("CFG_001", "Search configuration not found", HttpStatus.NOT_FOUND),
    REDIS_OPERATION_FAILED("CFG_002", "Failed to update search configuration", HttpStatus.INTERNAL_SERVER_ERROR),
    INTERNAL_ERROR("SYS_001", "Unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    SEARCH_DUPLICATION_ERROR("SEARCH_001", "A search app named already exists", HttpStatus.CONFLICT),
    INTERNAL_THREAD_INTERRUPTION("FDB_001","Hybrid search was interrupted while awaiting results",HttpStatus.INTERNAL_SERVER_ERROR),
    SEARCH_BACKEND_UNAVAILABLE("SEARCH_002", "Search is not available in this environment", HttpStatus.SERVICE_UNAVAILABLE),
    INVALID_FEEDBACK_SCORE("FDB_001","Score must be one of 1, 0, or -1",HttpStatus.BAD_REQUEST),
    JOB_ALREADY_RUNNING("JOB_001", "Job already running", HttpStatus.CONFLICT),
    PARSED_CONTENT_UNREADABLE("PCU_001", "Cannot read parsedContentRef", HttpStatus.UNPROCESSABLE_ENTITY),
    UNKNOWN_EMBEDDING_MODEL("UEM_001", "Unknown embedding model Id", HttpStatus.BAD_REQUEST),
    EMBEDDING_SERVICE("EMS_001", "Error from Embedding Service", HttpStatus.INTERNAL_SERVER_ERROR);
    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
