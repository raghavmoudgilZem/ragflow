package com.ragflow.retrieval.exception;

import static com.ragflow.retrieval.exception.ErrorCode.UNKNOWN_EMBEDDING_MODEL;

public class EmbeddingModelMismatchException extends BusinessException{

    private final String customMessage;


    public EmbeddingModelMismatchException(String kbId, String requestedEmbeddingModel, String registerEmbeddingModel) {
        super(UNKNOWN_EMBEDDING_MODEL);
        this.customMessage="Requested embedding model :"+requestedEmbeddingModel+" and register embedding model :"+registerEmbeddingModel+" mismatch for kb id : "+kbId;
    }


    @Override
    public String getMessage() {
        return customMessage;
    }
}
