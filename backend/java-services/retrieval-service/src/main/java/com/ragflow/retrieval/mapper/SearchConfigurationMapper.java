package com.ragflow.retrieval.mapper;

import com.ragflow.retrieval.dto.request.SearchConfigurationRequest;
import com.ragflow.retrieval.dto.response.SearchConfigurationResponse;
import com.ragflow.retrieval.entity.SearchConfiguration;
import org.springframework.stereotype.Component;

@Component
public class SearchConfigurationMapper {

    public SearchConfigurationResponse toResponse(
            SearchConfiguration configuration) {

        return new SearchConfigurationResponse(
                configuration.getSimilarityThreshold(),
                configuration.getKeywordWeight(),
                configuration.getSemanticWeight()
        );
    }

    public SearchConfiguration toModel(
            SearchConfigurationRequest request) {

        return SearchConfiguration.builder()
                .similarityThreshold(request.similarityThreshold())
                .keywordWeight(request.keywordWeight())
                .semanticWeight(request.semanticWeight())
                .build();
    }
}