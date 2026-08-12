package com.ragflow.dataset.exception;

import com.ragflow.dataset.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

/**
 * Central place that turns every exception raised from the dataset module into
 * the same ApiResponse shape the frontend already expects (code/message/data/errors),
 * equivalent to the try/except blocks wrapping every route in dataset_api.py.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private GlobalExceptionHandler(){}


    @ExceptionHandler(DatasetValidationException.class)
    public ResponseEntity<ErrorResponseDto> handleDatasetValidationException(DatasetValidationException ex, WebRequest req){
        ErrorResponseDto duplicateEmail = ErrorResponseDto.builder()
                .message(ex.getMessage())
                .error("Invalid input")
                .status(HttpStatus.BAD_REQUEST.value()) //400
                .timestamp(LocalDateTime.now())
                .path(req.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(duplicateEmail, HttpStatus.BAD_REQUEST);

    }

    @ExceptionHandler(DuplicateDatasetNameException.class)
    public ResponseEntity<ErrorResponseDto> handleDuplicateDatasetNameException(DuplicateDatasetNameException ex, WebRequest req){
        ErrorResponseDto duplicateEmail = ErrorResponseDto.builder()
                .message(ex.getMessage())
                .error("Duplicate data")
                .status(HttpStatus.CONFLICT.value()) //409
                .timestamp(LocalDateTime.now())
                .path(req.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(duplicateEmail, HttpStatus.CONFLICT);

    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest req){
        ErrorResponseDto duplicateEmail = ErrorResponseDto.builder()
                .message(ex.getMessage())
                .error("Failed")
                .status(HttpStatus.NOT_FOUND.value()) //409
                .timestamp(LocalDateTime.now())
                .path(req.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(duplicateEmail, HttpStatus.NOT_FOUND);

    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponseDto> handleForbiddenException(ForbiddenException ex, WebRequest req){
        ErrorResponseDto duplicateEmail = ErrorResponseDto.builder()
                .message(ex.getMessage())
                .error("Access denied for this user")
                .status(HttpStatus.FORBIDDEN.value())
                .timestamp(LocalDateTime.now())
                .path(req.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(duplicateEmail, HttpStatus.FORBIDDEN);

    }


}
