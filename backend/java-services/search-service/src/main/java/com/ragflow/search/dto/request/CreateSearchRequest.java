package com.ragflow.search.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for POST /api/v1/searches
 * Maps to Python monolith: save(**kwargs)
 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record CreateSearchRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        String description,

        String avatar,

        String searchConfig
) {}