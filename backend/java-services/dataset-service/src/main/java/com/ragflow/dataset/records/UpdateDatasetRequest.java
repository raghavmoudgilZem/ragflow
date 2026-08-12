package com.ragflow.dataset.records;

import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record UpdateDatasetRequest(

         String name,
         String description,
         String parserId,
         Map<String, Object>parserConfig,
         List<String> connectors,
         Integer pagerank
) {
}
