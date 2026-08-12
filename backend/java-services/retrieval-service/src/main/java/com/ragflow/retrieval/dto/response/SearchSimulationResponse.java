package com.ragflow.retrieval.dto.response;

import java.util.List;

public record SearchSimulationResponse(
        String query,
        List<SimulatedSearchResult> results
) {
}
