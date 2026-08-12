package com.ragflow.llmgateway.exception;

import com.ragflow.llmgateway.dto.ApiResponse;
import com.ragflow.llmgateway.dto.response.FieldErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link GlobalExceptionHandler} — verifies every exception type it handles maps
 * to the correct HTTP status and {@link ApiResponse} envelope shape.
 */
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void applicationException_mapsToItsOwnStatusAndMessage() {
        // Arrange
        ResourceNotFoundException exception = new ResourceNotFoundException("LLM factory 'Foo' not found");

        // Act
        ResponseEntity<ApiResponse<Void>> response = handler.handleApplicationException(exception);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
        assertThat(response.getBody().statusCode()).isEqualTo(404);
        assertThat(response.getBody().error()).isEqualTo("LLM factory 'Foo' not found");
        assertThat(response.getBody().data()).isNull();
    }

    @Test
    void methodArgumentNotValidException_returns400WithFieldErrorList() {
        // Arrange
        FieldError fieldError = new FieldError("request", "name", "must not be blank");
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        when(exception.getBindingResult()).thenReturn(bindingResult);

        // Act
        ResponseEntity<ApiResponse<List<FieldErrorResponse>>> response = handler.handleValidationException(exception);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
        assertThat(response.getBody().data()).containsExactly(new FieldErrorResponse("name", "must not be blank"));
    }

    @Test
    void methodArgumentNotValidException_withMultipleFieldErrors_returnsAllOfThem() {
        // Arrange
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("request", "name", "must not be blank"),
                new FieldError("request", "tag", "must be one of LLM, TEXT EMBEDDING")
        ));
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        when(exception.getBindingResult()).thenReturn(bindingResult);

        // Act
        ResponseEntity<ApiResponse<List<FieldErrorResponse>>> response = handler.handleValidationException(exception);

        // Assert
        assertThat(response.getBody().data()).hasSize(2);
    }

    @Test
    void constraintViolationException_returns400WithGenericMessage() {
        // Arrange
        ConstraintViolationException exception = new ConstraintViolationException("name must not be blank", Set.of());

        // Act
        ResponseEntity<ApiResponse<Void>> response = handler.handleConstraintViolation(exception);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Invalid request parameters");
    }

    @Test
    void handlerMethodValidationException_returns400WithGenericMessage() {
        // Arrange
        HandlerMethodValidationException exception = mock(HandlerMethodValidationException.class);

        // Act
        ResponseEntity<ApiResponse<Void>> response = handler.handleConstraintViolation(exception);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Invalid request parameters");
    }

    @Test
    void unhandledException_returns500WithoutLeakingTheRawMessage() {
        // Arrange — an unexpected exception with a message that should NOT be echoed to the client
        RuntimeException exception = new RuntimeException("npe at line 42, table 'secret_internal_table'");

        // Act
        ResponseEntity<ApiResponse<Void>> response = handler.handleUnexpectedException(exception);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("An unexpected error occurred");
        assertThat(response.getBody().error()).doesNotContain("secret_internal_table");
    }
}
