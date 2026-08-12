package com.ragflow.retrieval.config;

import com.ragflow.retrieval.cache.SearchConfigurationCache;
import com.ragflow.retrieval.entity.SearchConfiguration;
import com.ragflow.retrieval.repository.JpaSearchConfigurationRepository;
import com.ragflow.retrieval.repository.SearchConfigurationCacheRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SearchConfigurationInitializer {

    private final JpaSearchConfigurationRepository databaseRepository;
    private final SearchConfigurationCacheRepository repository;
    private final SearchConfigurationProperties properties;
    private final SearchConfigurationCache cache;

    @PostConstruct
    public void initialize() {
        log.info("Initializing search configuration.");
        SearchConfiguration configuration = databaseRepository
                .findFirstByIsDeletedFalseOrderByCreatedAtDesc()
                .orElseGet(this::createDefaultConfiguration);
        repository.save(configuration);
        cache.update(configuration);
        log.info("Search configuration loaded successfully.");
    }

    private SearchConfiguration createDefaultConfiguration() {
        log.info("No configuration found in Redis. Creating default configuration.");
        SearchConfiguration configuration = SearchConfiguration.builder()
                        .similarityThreshold(properties.getSimilarityThreshold())
                        .keywordWeight(properties.getKeywordWeight())
                        .semanticWeight(properties.getSemanticWeight())
                        .build();
        SearchConfiguration savedConfiguration = databaseRepository.save(configuration);
        log.info("Default search configuration saved to Redis.");
        return savedConfiguration;
    }

}