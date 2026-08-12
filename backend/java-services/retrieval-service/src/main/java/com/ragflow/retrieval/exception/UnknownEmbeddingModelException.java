package com.ragflow.retrieval.exception;

import static com.ragflow.retrieval.exception.ErrorCode.UNKNOWN_EMBEDDING_MODEL;

public class UnknownEmbeddingModelException extends BusinessException{

    private final String customMessage;

    public UnknownEmbeddingModelException(String embeddingModelId) {
        super(UNKNOWN_EMBEDDING_MODEL);
        this.customMessage="embeddingModelId '" + embeddingModelId + "' is not registered";
    }

    @Override
    public String getMessage() {
        return customMessage;
    }
}
