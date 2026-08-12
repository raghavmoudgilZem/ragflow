package com.ragflow.file.exception;

public class DuplicateFolderException extends BusinessException {

    private static final Integer ERROR_CODE = 1409;

    public DuplicateFolderException() {
        super(ERROR_CODE, "Folder already exists.");
    }

    public DuplicateFolderException(String message) {
        super(ERROR_CODE, message);
    }

}
