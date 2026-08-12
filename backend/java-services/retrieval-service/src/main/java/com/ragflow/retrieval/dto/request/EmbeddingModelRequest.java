package com.ragflow.retrieval.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EmbeddingModelRequest (@JsonProperty("llmName") String embeddingModelId){
}
