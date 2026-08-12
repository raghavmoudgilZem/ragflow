package com.ragflow.retrieval.cache;

import com.ragflow.retrieval.entity.SearchConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SearchConfigurationCache Tests")
class SearchConfigurationCacheTest {

    private SearchConfigurationCache cache;

    @BeforeEach
    void setUp() {
        cache = new SearchConfigurationCache();
    }

    @Nested
    @DisplayName("get()")
    class GetConfiguration {

        @Test
        @DisplayName("should return null when cache is empty")
        void shouldReturnNullWhenCacheIsEmpty() {
            // Act
            Optional<SearchConfiguration> result = cache.get();

            // Assert
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("should return cached configuration")
        void shouldReturnCachedConfiguration() {
            // Arrange
            SearchConfiguration configuration = SearchConfiguration.builder()
                    .similarityThreshold(0.75)
                    .keywordWeight(0.30)
                    .semanticWeight(0.70)
                    .build();

            cache.update(configuration);

            // Act
            Optional<SearchConfiguration> result = cache.get();

            // Assert
            assertTrue(result.isPresent());

            SearchConfiguration cachedConfiguration = result.get();
            assertEquals(0.75, cachedConfiguration.getSimilarityThreshold());
            assertEquals(0.30, cachedConfiguration.getKeywordWeight());
            assertEquals(0.70, cachedConfiguration.getSemanticWeight());
        }
    }

    @Nested
    @DisplayName("update()")
    class UpdateConfiguration {

        @Test
        @DisplayName("should update cache with new configuration")
        void shouldUpdateCacheWithNewConfiguration() {
            // Arrange
            SearchConfiguration configuration = SearchConfiguration.builder()
                    .similarityThreshold(0.75)
                    .keywordWeight(0.30)
                    .semanticWeight(0.70)
                    .build();

            // Act
            cache.update(configuration);

            // Assert
            Optional<SearchConfiguration> result = cache.get();
            assertTrue(result.isPresent());
            assertSame(configuration, result.orElseThrow());
        }

        @Test
        @DisplayName("should replace existing configuration")
        void shouldReplaceExistingConfiguration() {
            // Arrange
            SearchConfiguration initialConfiguration = SearchConfiguration.builder()
                    .similarityThreshold(0.70)
                    .keywordWeight(0.25)
                    .semanticWeight(0.75)
                    .build();

            SearchConfiguration updatedConfiguration = SearchConfiguration.builder()
                    .similarityThreshold(0.90)
                    .keywordWeight(0.10)
                    .semanticWeight(0.90)
                    .build();

            cache.update(initialConfiguration);

            // Act
            cache.update(updatedConfiguration);

            // Assert
            Optional<SearchConfiguration> result = cache.get();

            assertTrue(result.isPresent());
            assertSame(updatedConfiguration, result.get());

            assertEquals(0.90, result.get().getSimilarityThreshold());
            assertEquals(0.10, result.get().getKeywordWeight());
            assertEquals(0.90, result.get().getSemanticWeight());
        }

        @Test
        @DisplayName("should throw NullPointerException when configuration is null")
        void shouldThrowExceptionWhenConfigurationIsNull() {
            // Act & Assert
            NullPointerException exception = assertThrows(
                    NullPointerException.class,
                    () -> cache.update(null)
            );

            assertEquals(
                    "Search configuration must not be null",
                    exception.getMessage()
            );
        }
    }
}