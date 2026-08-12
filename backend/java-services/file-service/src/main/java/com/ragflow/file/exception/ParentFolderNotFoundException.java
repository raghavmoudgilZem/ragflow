package com.ragflow.file.exception;

public class ParentFolderNotFoundException extends RuntimeException {

    public ParentFolderNotFoundException(String message) {
        super(message);
    }
}