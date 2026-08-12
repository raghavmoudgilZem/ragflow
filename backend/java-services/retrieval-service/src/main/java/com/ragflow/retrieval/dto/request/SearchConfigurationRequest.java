package com.ragflow.retrieval.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request to update search configuration weights")
public record SearchConfigurationRequest(
        @Schema(
                example = "0.5",
                description = "Similarity threshold (0.0 - 1.0)"
        )
        @NotNull(message = "Similarity threshold is required.")
        @DecimalMin(
                value = "0.0",
                message = "Value must be greater than or equal to 0.0"
        )
        @DecimalMax(
                value = "1.0",
                message = "Value must be less than or equal to 1.0"
        )
        Double similarityThreshold,

        @Schema(
                example = "0.3",
                description = "Keyword weight (0.0 - 1.0)"
        )
        @NotNull(message = "Keyword weight is required.")
        @DecimalMin(
                value = "0.0",
                message = "Value must be greater than or equal to 0.0"
        )
        @DecimalMax(
                value = "1.0",
                message = "Value must be less than or equal to 1.0"
        )
        Double keywordWeight,

        @Schema(
                example = "0.2",
                description = "Semantic weight (0.0 - 1.0)"
        )
        @NotNull(message = "Semantic weight is required.")
        @DecimalMin(
                value = "0.0",
                message = "Value must be greater than or equal to 0.0"
        )
        @DecimalMax(
                value = "1.0",
                message = "Value must be less than or equal to 1.0"
        )
        Double semanticWeight

) {
}