package com.ragflow.dataset.enums;


import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EmbeddingModel {

    LLAMA3("llama3.2"),
    NOMIC_EMBED_TEXT("nomic-embed-text");

    private final String modelName;

    @JsonCreator
    public static EmbeddingModel fromValue(String value) {
        for (EmbeddingModel model : values()) {
            if (model.modelName.equalsIgnoreCase(value)) {
                return model;
            }
        }
        throw new IllegalArgumentException("Invalid embedding model: " + value);
    }
}