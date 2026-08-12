package com.ragflow.retrieval.repository.impl;

import com.ragflow.retrieval.constants.RedisConstants;
import com.ragflow.retrieval.entity.SearchConfiguration;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.repository.SearchConfigurationCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class RedisSearchConfigurationRepository implements SearchConfigurationCacheRepository {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public Optional<SearchConfiguration> find() {
        try{
            log.debug("Fetching search configuration from Redis.");
            SearchConfiguration configuration = (SearchConfiguration) redisTemplate.opsForValue().get(RedisConstants.SEARCH_CONFIGURATION_KEY);
            return Optional.ofNullable(configuration);
        } catch (DataAccessException ex) {
            log.error("Failed to fetch search configuration from Redis.", ex);
            throw new BusinessException(ErrorCode.REDIS_OPERATION_FAILED);
        }
    }

    @Override
    public SearchConfiguration save(SearchConfiguration configuration) {
        try {
            log.debug("Saving search configuration to Redis.");
            redisTemplate.opsForValue().set(RedisConstants.SEARCH_CONFIGURATION_KEY, configuration);
            return configuration;
        } catch (DataAccessException ex) {
            log.error("Failed to save search configuration to Redis.", ex);
            throw new BusinessException(ErrorCode.REDIS_OPERATION_FAILED);
        }
    }

}
