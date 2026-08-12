package com.ragflow.retrieval.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record EmbedRequest(
        @JsonProperty("model") String embeddingModelId,
        @JsonProperty("input") List<String> texts) {
}
