package com.ragflow.retrieval.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FeedbackRequest(
        @NotBlank(message = "Query ID must not be blank")
        String queryId,
        @NotBlank(message = "Chunk ID must not be blank")
        String chunkId,
        @NotNull(message = "Score must not be null")
        Integer score
) {
}
