package com.ragflow.retrieval.exception;

public class JobAlreadyRunningException extends BusinessException{

    private final String customMessage;

    public JobAlreadyRunningException(String docId, Long existingJobId) {
        super(ErrorCode.JOB_ALREADY_RUNNING);
        this.customMessage= "An index job (" + existingJobId + ") is already RUNNING for docId=" + docId;
    }

    @Override
    public String getMessage() {
        return customMessage;
    }
}
