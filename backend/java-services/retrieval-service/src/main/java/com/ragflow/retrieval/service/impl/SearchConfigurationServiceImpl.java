package com.ragflow.retrieval.service.impl;

import com.ragflow.retrieval.cache.SearchConfigurationCache;
import com.ragflow.retrieval.dto.request.SearchConfigurationRequest;
import com.ragflow.retrieval.dto.response.SearchConfigurationResponse;
import com.ragflow.retrieval.entity.SearchConfiguration;
import com.ragflow.retrieval.event.SearchConfigurationUpdatedEvent;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.mapper.SearchConfigurationMapper;
import com.ragflow.retrieval.repository.JpaSearchConfigurationRepository;
import com.ragflow.retrieval.repository.SearchConfigurationCacheRepository;
import com.ragflow.retrieval.service.SearchConfigurationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchConfigurationServiceImpl implements SearchConfigurationService {

    private final SearchConfigurationCacheRepository redisRepository;
    private final JpaSearchConfigurationRepository databaseRepository;
    private final SearchConfigurationCache localCache;
    private final SearchConfigurationMapper mapper;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Retrieves the current active search configuration using the Cache-Aside pattern.
     *
     * <p>The lookup order is:
     * <ol>
     *   <li>Local Cache</li>
     *   <li>Redis Cache</li>
     *   <li>Database</li>
     * </ol>
     *
     * <p>If the configuration is loaded from the database, Redis and the local cache
     * are populated before returning the response.
     *
     * @return the active search configuration
     * @throws BusinessException if no active configuration exists
     */
    @Override
    public SearchConfigurationResponse getConfiguration() {
        log.info("Fetching search configuration from cache");
        Optional<SearchConfiguration> localConfiguration = localCache.get();
        if (localConfiguration.isPresent()) {
            log.debug("Search configuration found in local cache: {}", localConfiguration.get());
            return mapper.toResponse(localConfiguration.get());
        }
        log.info("Local cache miss. Looking up Redis.");
        Optional<SearchConfiguration> redisConfiguration = redisRepository.find();
        if (redisConfiguration.isPresent()) {
            log.debug("Search configuration found in Redis: {}", redisConfiguration.get());
            localCache.update(redisConfiguration.get());
            return mapper.toResponse(redisConfiguration.get());
        }
        log.info("Redis cache miss. Looking up database.");
        SearchConfiguration databaseConfiguration = getActiveConfiguration().orElseThrow(() -> new BusinessException(ErrorCode.SEARCH_CONFIGURATION_NOT_FOUND));
        log.debug("Search configuration found in database: {}",databaseConfiguration);
        redisRepository.save(databaseConfiguration);
        localCache.update(databaseConfiguration);
        return mapper.toResponse(databaseConfiguration);
    }

    /**
     * Updates the search configuration.
     *
     * <p>The existing active configuration, if present, is marked as deleted and a
     * new configuration is persisted. A configuration update event is published
     * after the new configuration is successfully saved. Cache synchronization is
     * handled by the event listener after the transaction commits.
     *
     * @param request the new search configuration values
     * @return the updated search configuration
     */
    @Override
    @Transactional
    public SearchConfigurationResponse updateConfiguration(SearchConfigurationRequest request) {
        log.info("Updating search configuration with request: {}", request);
        getActiveConfiguration().ifPresent(this::deactivate);
        SearchConfiguration configuration = mapper.toModel(request);
        SearchConfiguration savedConfiguration = databaseRepository.save(configuration);
        eventPublisher.publishEvent(new SearchConfigurationUpdatedEvent(savedConfiguration));
        log.info("Search configuration cache updated successfully");
        return mapper.toResponse(savedConfiguration);
    }

    /**
     * Marks the specified configuration as inactive using the soft-delete strategy.
     *
     * @param configuration the active configuration to deactivate
     */
    private void deactivate(SearchConfiguration configuration) {
        log.debug("Marking search configuration {} as deleted.", configuration.getId());
        configuration.setIsDeleted(true);
        databaseRepository.save(configuration);
    }

    /**
     * Retrieves the latest active search configuration from the database.
     *
     * @return an {@link Optional} containing the active configuration if present;
     * otherwise an empty {@link Optional}
     */
    private Optional<SearchConfiguration> getActiveConfiguration() {
        return databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc();
    }
}