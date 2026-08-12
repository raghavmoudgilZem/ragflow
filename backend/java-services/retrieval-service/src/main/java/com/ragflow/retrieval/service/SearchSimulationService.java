package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.response.SearchSimulationResponse;

public interface SearchSimulationService {
    SearchSimulationResponse simulate(String query, int topK);
}
