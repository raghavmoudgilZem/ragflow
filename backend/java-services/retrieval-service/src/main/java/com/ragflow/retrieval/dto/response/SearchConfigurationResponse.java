package com.ragflow.retrieval.dto.response;

public record SearchConfigurationResponse(
        Double similarityThreshold,
        Double keywordWeight,
        Double semanticWeight) {
}