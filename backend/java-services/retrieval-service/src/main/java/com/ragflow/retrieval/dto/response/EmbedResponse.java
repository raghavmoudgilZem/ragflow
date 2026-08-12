package com.ragflow.retrieval.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record EmbedResponse(
        @JsonProperty("embeddings") List<float[]> embeddings
) {
}
