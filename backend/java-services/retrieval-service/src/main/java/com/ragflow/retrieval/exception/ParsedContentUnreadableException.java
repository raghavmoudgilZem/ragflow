package com.ragflow.retrieval.exception;

import static com.ragflow.retrieval.exception.ErrorCode.PARSED_CONTENT_UNREADABLE;

public class ParsedContentUnreadableException extends BusinessException{

    private final String customMessage;

    public ParsedContentUnreadableException(String storageType, String bucket, String objectKey) {
        super(PARSED_CONTENT_UNREADABLE);
        this.customMessage="Cannot read parsedContentRef at " + storageType + ":" + bucket + "/" + objectKey;
    }

    @Override
    public String getMessage() {
        return customMessage;
    }
}
