package com.ragflow.retrieval.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SimulatedSearchResult(
        String chunkId,
        String content,
        @JsonProperty("_debug") DebugInfo debug
) {
}
