package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.ScoredChunk;

import java.util.List;

public interface KeywordSearchService {
    List<ScoredChunk> search(String query, int topK);
}