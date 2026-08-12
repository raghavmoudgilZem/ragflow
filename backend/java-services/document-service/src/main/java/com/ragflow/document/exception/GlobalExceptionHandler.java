package com.ragflow.document.exception;

import com.ragflow.document.dto.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Optional;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.util.HtmlUtils;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    public static final String BAD_REQUEST = "Bad Request";

    // Handles 400 Bad Request (Validation Failures) @Valid or @Validated fails on a @RequestBody object
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<String>> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation failed for request: {}",ex);

        Optional<FieldError> fieldError = ex.getBindingResult().getFieldErrors().stream().limit(1L)
                .findFirst();
        String errorMsg = "One or more fields failed validation";
        if(fieldError.isPresent()) {
            errorMsg = errorMsg + fieldError.get().getField()+": "+fieldError.get().getDefaultMessage();
        }
        return ApiResponse.error(HttpStatus.BAD_REQUEST, "error", errorMsg);
    }

    // jakarta Validation fails on method parameters (@PathVariable, @RequestParam, @RequestHeader, @CookieValue)
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<String>> handleValidationExceptions(HandlerMethodValidationException ex, HttpServletRequest request) {
        log.warn("Validation failed for request: {}", ex);

        return ApiResponse.error(HttpStatus.BAD_REQUEST, "error", Arrays.toString(ex.getDetailMessageArguments()));

    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiResponse<String>> handleMissingRequestHeaderExceptions(MissingRequestHeaderException ex, HttpServletRequest request) {
        log.warn("Validation failed for request: {}", ex);
        return ApiResponse.error(HttpStatus.BAD_REQUEST, "error", ex.getMessage());
    }

    //MissingPathVariableException.class

    //HttpMediaTypeNotSupportedException.class

    //HttpMediaTypeNotAcceptableException.class

    //HttpMessageNotReadableException.class

    //NoHandlerFoundException.class

    //TypeMismatchException.class


    //Spring cannot convert request value to required type
    @ExceptionHandler({MethodArgumentTypeMismatchException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiResponse<String>> handleNoHandlerFoundException(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        log.warn("Endpoint does not exist: {}", request.getRequestURI());
        String sanitizedRequest = HtmlUtils.htmlEscape(request.getRequestURI());
        return ApiResponse.error(HttpStatus.NOT_FOUND, "error", String.format("The requested endpoint '%s' does not exist.", sanitizedRequest));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<String>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        log.warn("HTTP method not supported: {}", ex.getMethod());
        return ApiResponse.error(HttpStatus.METHOD_NOT_ALLOWED, "error", String.format("The HTTP method '%s' is not supported for this endpoint.", ex.getMethod()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<String>> handleMissingParams(MissingServletRequestParameterException ex, HttpServletRequest request) {
        log.warn("Missing required parameter: {}", ex.getParameterName());
        return ApiResponse.error(HttpStatus.BAD_REQUEST, "error", String.format("The required query parameter '%s' is missing.", ex.getParameterName()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<String>> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        log.warn("Constraint violation on request parameters: {}", request.getRequestURI());

        String fieldError = ex.getConstraintViolations().stream()
                .findFirst().stream().map(violation -> {
                    // Extract just the parameter name from the path (e.g., "getContracts.page" -> "page")
                    String path = violation.getPropertyPath().toString();
                    String field = path.substring(path.lastIndexOf('.') + 1);
                    return field+": "+ violation.getMessage();})
                .toString();
        return ApiResponse.error(HttpStatus.BAD_REQUEST, "error", fieldError);

    }

    // 2. NEW: Handles 400 Bad Request (Malformed JSON / Type Mismatches)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<String>> handleMalformedJson(HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Malformed JSON received: {}", ex.getMessage());
        return ApiResponse.error(HttpStatus.BAD_REQUEST, "error", "The request body is unreadable or malformed. Please check your JSON syntax.");
    }

    // 5. NEW: Handles 409 Conflict (Database Unique Constraint / Race Conditions)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<String>> handleDatabaseConflict(DataIntegrityViolationException ex, HttpServletRequest request) {
        log.error("Database integrity violation (possible race condition): {}", ex.getMessage());
        return ApiResponse.error(HttpStatus.CONFLICT, "error", "A conflict occurred while saving data. This request may have already been processed.");
    }

    // Handles 404 Not Found
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<String>> handleNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ApiResponse.error(HttpStatus.NOT_FOUND, "error", ex.getMessage());
    }

    // Handles 409 Conflict (e.g., Double Funding, Idempotency Violations)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<String>> handleConflict(IllegalStateException ex, HttpServletRequest request) {
        log.error("Business conflict: {}", ex.getMessage());
        return ApiResponse.error(HttpStatus.CONFLICT, "error", ex.getMessage());
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ApiResponse<String>> handleIdempotencyConflict(IdempotencyConflictException ex, HttpServletRequest request) {
        log.warn("Idempotency conflict for key: {}", ex.getKey()); // Use log.warn for business errors
        return ApiResponse.error(HttpStatus.CONFLICT, "error", ex.getMessage());
    }

    // Handles 500 Internal Server Error (Catch-all)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleAllUncaughtException(Exception ex, HttpServletRequest request) {
        log.error("Unknown error occurred", ex);
        return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "error", "An unexpected error occurred. "+ex.getMessage());
    }
}
