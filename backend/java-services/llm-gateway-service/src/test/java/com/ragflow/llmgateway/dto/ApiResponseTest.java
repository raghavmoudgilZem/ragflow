package com.ragflow.llmgateway.dto;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link ApiResponse}'s static factory methods.
 */
class ApiResponseTest {

    @Test
    void ok_buildsSuccessEnvelopeWithStatus200AndNoError() {
        // Arrange
        Instant before = Instant.now();

        // Act
        ApiResponse<String> response = ApiResponse.ok("payload");

        // Assert
        assertThat(response.success()).isTrue();
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.message()).isEqualTo("Success");
        assertThat(response.error()).isNull();
        assertThat(response.data()).isEqualTo("payload");
        assertThat(response.timestamp()).isNotNull().isAfterOrEqualTo(before);
    }

    @Test
    void created_buildsSuccessEnvelopeWithStatus201() {
        // Act
        ApiResponse<String> response = ApiResponse.created("new-resource");

        // Assert
        assertThat(response.success()).isTrue();
        assertThat(response.statusCode()).isEqualTo(201);
        assertThat(response.message()).isEqualTo("Created");
        assertThat(response.data()).isEqualTo("new-resource");
    }

    @Test
    void error_buildsFailureEnvelopeWithNullMessageAndNullData() {
        // Act
        ApiResponse<Object> response = ApiResponse.error(404, "not found");

        // Assert
        assertThat(response.success()).isFalse();
        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(response.message()).isNull();
        assertThat(response.error()).isEqualTo("not found");
        assertThat(response.data()).isNull();
    }

    @Test
    void ok_acceptsNullDataWithoutThrowing() {
        // Act
        ApiResponse<String> response = ApiResponse.ok(null);

        // Assert
        assertThat(response.success()).isTrue();
        assertThat(response.data()).isNull();
    }
}
