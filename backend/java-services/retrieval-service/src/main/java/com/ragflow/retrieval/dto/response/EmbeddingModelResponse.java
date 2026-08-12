package com.ragflow.retrieval.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EmbeddingModelResponse(@JsonProperty("status") Boolean existStatus,
                                     @JsonProperty("dim") Integer dimension) {
}
