package com.ragflow.file.exception;

public class PermissionDeniedException
        extends RuntimeException{

    public PermissionDeniedException(
            String message){

        super(message);

    }

}
