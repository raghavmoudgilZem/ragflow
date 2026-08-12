package com.ragflow.retrieval.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DebugInfo(
        @JsonProperty("rawVectorScore") Double rawVectorScore,
        @JsonProperty("rawBm25Score") Double rawBm25Score,
        @JsonProperty("matchedKeywords") List<String> matchedKeywords,
        @JsonProperty("rrfScore") Double rrfScore
) {
}