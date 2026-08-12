package com.ragflow.search.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record HealthResponse(
        String status,
        String service,
        int port,
        String timestamp
) {
    public static HealthResponse up() {
        return new HealthResponse("UP", "search-service", 9407, Instant.now().toString());
    }
}