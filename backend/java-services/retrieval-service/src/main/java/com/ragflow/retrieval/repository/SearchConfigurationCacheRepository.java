package com.ragflow.retrieval.repository;

import com.ragflow.retrieval.entity.SearchConfiguration;

import java.util.Optional;

public interface SearchConfigurationCacheRepository {
    Optional<SearchConfiguration> find();
    SearchConfiguration save(SearchConfiguration configuration);
}
