package com.ragflow.retrieval.dto.request;

public record Chunk(int index, String content, int tokenCount) {
}
