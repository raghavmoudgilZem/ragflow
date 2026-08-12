package com.ragflow.retrieval.config;

import com.ragflow.retrieval.cache.SearchConfigurationCache;
import com.ragflow.retrieval.entity.SearchConfiguration;
import com.ragflow.retrieval.repository.JpaSearchConfigurationRepository;
import com.ragflow.retrieval.repository.SearchConfigurationCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StartupConfigurationInitializer Tests")
class StartupConfigurationInitializerTest {

    @Mock
    private JpaSearchConfigurationRepository databaseRepository;

    @Mock
    private SearchConfigurationCacheRepository repository;

    @Mock
    private SearchConfigurationProperties properties;

    @Mock
    private SearchConfigurationCache cache;

    @InjectMocks
    private SearchConfigurationInitializer initializer;

    private SearchConfiguration existingConfiguration;

    @BeforeEach
    void setUp() {
        existingConfiguration = SearchConfiguration.builder()
                .similarityThreshold(0.75)
                .keywordWeight(0.4)
                .semanticWeight(0.6)
                .build();
    }

    @Nested
    @DisplayName("initialize()")
    class Initialize {

        @Test
        void initialize_shouldUseExistingConfiguration_whenOneExistsInDatabase() {
            // given
            when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                    .thenReturn(Optional.of(existingConfiguration));

            // when
            initializer.initialize();

            // then
            verify(databaseRepository, times(1)).findFirstByIsDeletedFalseOrderByCreatedAtDesc();
            verify(databaseRepository, never()).save(any(SearchConfiguration.class));

            ArgumentCaptor<SearchConfiguration> repoCaptor = ArgumentCaptor.forClass(SearchConfiguration.class);
            verify(repository, times(1)).save(repoCaptor.capture());
            assertThat(repoCaptor.getValue()).isEqualTo(existingConfiguration);

            ArgumentCaptor<SearchConfiguration> cacheCaptor = ArgumentCaptor.forClass(SearchConfiguration.class);
            verify(cache, times(1)).update(cacheCaptor.capture());
            assertThat(cacheCaptor.getValue()).isEqualTo(existingConfiguration);

            verifyNoInteractions(properties);
        }

        @Test
        void initialize_shouldCreateDefaultConfiguration_whenNoneExistsInDatabase() {
            // given
            when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                    .thenReturn(Optional.empty());

            when(properties.getSimilarityThreshold()).thenReturn(0.8);
            when(properties.getKeywordWeight()).thenReturn(.5);
            when(properties.getSemanticWeight()).thenReturn(0.5);

            SearchConfiguration savedDefault = SearchConfiguration.builder()
                    .similarityThreshold(0.8)
                    .keywordWeight(0.5)
                    .semanticWeight(0.5)
                    .build();
            when(databaseRepository.save(any(SearchConfiguration.class))).thenReturn(savedDefault);

            // when
            initializer.initialize();

            // then
            verify(databaseRepository, times(1)).findFirstByIsDeletedFalseOrderByCreatedAtDesc();

            ArgumentCaptor<SearchConfiguration> createdCaptor = ArgumentCaptor.forClass(SearchConfiguration.class);
            verify(databaseRepository, times(1)).save(createdCaptor.capture());
            SearchConfiguration createdConfig = createdCaptor.getValue();
            assertThat(createdConfig.getSimilarityThreshold()).isEqualByComparingTo(0.8);
            assertThat(createdConfig.getKeywordWeight()).isEqualByComparingTo(0.5);
            assertThat(createdConfig.getSemanticWeight()).isEqualByComparingTo(0.5);

            verify(repository, times(1)).save(savedDefault);
            verify(cache, times(1)).update(savedDefault);
        }

        @Test
        void initialize_shouldPropagateException_whenDatabaseLookupFails() {
            // given
            when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                    .thenThrow(new RuntimeException("DB connection error"));

            // when / then
            try {
                initializer.initialize();
            } catch (RuntimeException ex) {
                assertThat(ex).hasMessage("DB connection error");
            }

            verify(repository, never()).save(any());
            verify(cache, never()).update(any());
        }
    }
}