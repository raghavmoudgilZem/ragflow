package com.ragflow.retrieval.repository.impl;

import com.ragflow.retrieval.constants.RedisConstants;
import com.ragflow.retrieval.entity.SearchConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RedisSearchConfigurationRepository Tests")
class RedisSearchConfigurationRepositoryTest {

    @Mock
    private RedisTemplate<String, SearchConfiguration> redisTemplate;

    @Mock
    private ValueOperations<String, SearchConfiguration> valueOperations;

    @InjectMocks
    private RedisSearchConfigurationRepository repository;

    @Nested
    @DisplayName("find()")
    class FindConfiguration {

        @Test
        @DisplayName("should return configuration when present in Redis")
        void shouldReturnConfigurationWhenPresent() {
            // Arrange
            SearchConfiguration configuration = SearchConfiguration.builder()
                    .similarityThreshold(0.75)
                    .keywordWeight(0.30)
                    .semanticWeight(0.70)
                    .build();

            when(redisTemplate.opsForValue()).thenReturn(valueOperations);
            when(valueOperations.get(RedisConstants.SEARCH_CONFIGURATION_KEY))
                    .thenReturn(configuration);

            // Act
            Optional<SearchConfiguration> result = repository.find();

            // Assert
            assertTrue(result.isPresent());
            assertEquals(configuration, result.get());

            verify(redisTemplate).opsForValue();
            verify(valueOperations).get(RedisConstants.SEARCH_CONFIGURATION_KEY);
        }

        @Test
        @DisplayName("should return empty when configuration does not exist")
        void shouldReturnEmptyWhenConfigurationDoesNotExist() {
            // Arrange
            when(redisTemplate.opsForValue()).thenReturn(valueOperations);
            when(valueOperations.get(RedisConstants.SEARCH_CONFIGURATION_KEY))
                    .thenReturn(null);

            // Act
            Optional<SearchConfiguration> result = repository.find();

            // Assert
            assertTrue(result.isEmpty());

            verify(redisTemplate).opsForValue();
            verify(valueOperations).get(RedisConstants.SEARCH_CONFIGURATION_KEY);
        }
    }

    @Nested
    @DisplayName("save()")
    class SaveConfiguration {

        @Test
        @DisplayName("should save configuration to Redis and return it")
        void shouldSaveConfiguration() {
            // Arrange
            SearchConfiguration configuration = SearchConfiguration.builder()
                    .similarityThreshold(0.75)
                    .keywordWeight(0.30)
                    .semanticWeight(0.70)
                    .build();

            when(redisTemplate.opsForValue()).thenReturn(valueOperations);

            // Act
            SearchConfiguration result = repository.save(configuration);

            // Assert
            assertSame(configuration, result);

            verify(redisTemplate).opsForValue();
            verify(valueOperations).set(
                    RedisConstants.SEARCH_CONFIGURATION_KEY,
                    configuration
            );
        }
    }
}