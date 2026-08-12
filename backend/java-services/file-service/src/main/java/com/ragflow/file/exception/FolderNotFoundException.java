package com.ragflow.file.exception;

public class FolderNotFoundException extends BusinessException {

    private static final Integer ERROR_CODE = 1404;

    public FolderNotFoundException() {
        super(ERROR_CODE, "Parent folder not found.");
    }

    public FolderNotFoundException(String message) {
        super(ERROR_CODE, message);
    }

}
