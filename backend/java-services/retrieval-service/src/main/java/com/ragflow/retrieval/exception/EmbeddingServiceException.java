package com.ragflow.retrieval.exception;

import static com.ragflow.retrieval.exception.ErrorCode.EMBEDDING_SERVICE;

public class EmbeddingServiceException extends BusinessException{

    private final String customMessage;

    public EmbeddingServiceException(String customMessage) {
        super(EMBEDDING_SERVICE);
        this.customMessage = customMessage;
    }

    @Override
    public String getMessage() {
        return customMessage;
    }
}
