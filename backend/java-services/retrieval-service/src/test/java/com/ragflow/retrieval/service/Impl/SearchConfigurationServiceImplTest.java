package com.ragflow.retrieval.service.Impl;

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
import com.ragflow.retrieval.service.impl.SearchConfigurationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchConfigurationServiceImplTest {

    @Mock
    private SearchConfigurationCacheRepository redisRepository;

    @Mock
    private JpaSearchConfigurationRepository databaseRepository;

    @Mock
    private SearchConfigurationCache localCache;

    @Mock
    private SearchConfigurationMapper mapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private SearchConfigurationServiceImpl service;

    private SearchConfiguration configuration;
    private SearchConfigurationResponse response;

    @BeforeEach
    void setUp() {
        configuration = SearchConfiguration.builder()
                .id(UUID.randomUUID())
                .similarityThreshold(0.75)
                .keywordWeight(0.4)
                .semanticWeight(0.6)
                .isDeleted(false)
                .build();

        response = new SearchConfigurationResponse(0.75, 0.4, 0.6);
    }

    // ---------------------------------------------------------------------
    // getConfiguration()
    // ---------------------------------------------------------------------

    @Test
    void getConfiguration_shouldReturnFromLocalCache_whenPresent() {
        // given
        when(localCache.get()).thenReturn(Optional.of(configuration));
        when(mapper.toResponse(configuration)).thenReturn(response);

        // when
        SearchConfigurationResponse result = service.getConfiguration();

        // then
        assertThat(result).isEqualTo(response);
        verify(localCache, times(1)).get();
        verifyNoInteractions(redisRepository);
        verifyNoInteractions(databaseRepository);
        verify(localCache, never()).update(any());
    }

    @Test
    void getConfiguration_shouldReturnFromRedis_whenLocalCacheMissesAndRedisHits() {
        // given
        when(localCache.get()).thenReturn(Optional.empty());
        when(redisRepository.find()).thenReturn(Optional.of(configuration));
        when(mapper.toResponse(configuration)).thenReturn(response);

        // when
        SearchConfigurationResponse result = service.getConfiguration();

        // then
        assertThat(result).isEqualTo(response);
        verify(redisRepository, times(1)).find();
        verify(localCache, times(1)).update(configuration);
        verifyNoInteractions(databaseRepository);
    }

    @Test
    void getConfiguration_shouldReturnFromDatabase_whenLocalAndRedisMiss() {
        // given
        when(localCache.get()).thenReturn(Optional.empty());
        when(redisRepository.find()).thenReturn(Optional.empty());
        when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                .thenReturn(Optional.of(configuration));
        when(mapper.toResponse(configuration)).thenReturn(response);

        // when
        SearchConfigurationResponse result = service.getConfiguration();

        // then
        assertThat(result).isEqualTo(response);
        verify(databaseRepository, times(1)).findFirstByIsDeletedFalseOrderByCreatedAtDesc();
        verify(redisRepository, times(1)).save(configuration);
        verify(localCache, times(1)).update(configuration);
    }

    @Test
    void getConfiguration_shouldThrowBusinessException_whenNoConfigurationExistsAnywhere() {
        // given
        when(localCache.get()).thenReturn(Optional.empty());
        when(redisRepository.find()).thenReturn(Optional.empty());
        when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                .thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> service.getConfiguration())
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SEARCH_CONFIGURATION_NOT_FOUND));

        verify(redisRepository, never()).save(any());
        verify(localCache, never()).update(any());
        verifyNoInteractions(mapper);
    }

    // ---------------------------------------------------------------------
    // updateConfiguration()
    // ---------------------------------------------------------------------

    @Test
    void updateConfiguration_shouldDeactivateExistingConfiguration_whenOneExists() {
        // given
        SearchConfigurationRequest request = mock(SearchConfigurationRequest.class);
        SearchConfiguration newConfiguration = SearchConfiguration.builder()
                .similarityThreshold(0.9)
                .keywordWeight(0.3)
                .semanticWeight(0.7)
                .build();
        SearchConfiguration savedConfiguration = SearchConfiguration.builder()
                .id(UUID.randomUUID())
                .similarityThreshold(0.9)
                .keywordWeight(0.3)
                .semanticWeight(0.7)
                .isDeleted(false)
                .build();
        SearchConfigurationResponse updatedResponse = new SearchConfigurationResponse(0.9, 0.3, 0.7);

        when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                .thenReturn(Optional.of(configuration));
        when(mapper.toModel(request)).thenReturn(newConfiguration);
        when(databaseRepository.save(any(SearchConfiguration.class)))
                .thenReturn(configuration) // first call: deactivate save
                .thenReturn(savedConfiguration); // second call: new config save
        when(mapper.toResponse(savedConfiguration)).thenReturn(updatedResponse);

        // when
        SearchConfigurationResponse result = service.updateConfiguration(request);

        // then
        assertThat(result).isEqualTo(updatedResponse);
        assertThat(configuration.getIsDeleted()).isTrue();

        ArgumentCaptor<SearchConfiguration> saveCaptor = ArgumentCaptor.forClass(SearchConfiguration.class);
        verify(databaseRepository, times(2)).save(saveCaptor.capture());
        assertThat(saveCaptor.getAllValues().get(0)).isEqualTo(configuration);
        assertThat(saveCaptor.getAllValues().get(1)).isEqualTo(newConfiguration);

        ArgumentCaptor<SearchConfigurationUpdatedEvent> eventCaptor =
                ArgumentCaptor.forClass(SearchConfigurationUpdatedEvent.class);
        verify(eventPublisher, times(1)).publishEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().configuration()).isEqualTo(savedConfiguration);
    }

    @Test
    void updateConfiguration_shouldSkipDeactivation_whenNoActiveConfigurationExists() {
        // given
        SearchConfigurationRequest request = mock(SearchConfigurationRequest.class);
        SearchConfiguration newConfiguration = SearchConfiguration.builder()
                .similarityThreshold(0.9)
                .keywordWeight(0.3)
                .semanticWeight(0.7)
                .build();
        SearchConfiguration savedConfiguration = SearchConfiguration.builder()
                .id(UUID.randomUUID())
                .similarityThreshold(0.9)
                .keywordWeight(0.3)
                .semanticWeight(0.7)
                .build();
        SearchConfigurationResponse updatedResponse = new SearchConfigurationResponse(0.9, 0.3, 0.7);

        when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                .thenReturn(Optional.empty());
        when(mapper.toModel(request)).thenReturn(newConfiguration);
        when(databaseRepository.save(newConfiguration)).thenReturn(savedConfiguration);
        when(mapper.toResponse(savedConfiguration)).thenReturn(updatedResponse);

        // when
        SearchConfigurationResponse result = service.updateConfiguration(request);

        // then
        assertThat(result).isEqualTo(updatedResponse);
        verify(databaseRepository, times(1)).save(any(SearchConfiguration.class));
        verify(eventPublisher, times(1))
                .publishEvent(new SearchConfigurationUpdatedEvent(savedConfiguration));
    }

    @Test
    void updateConfiguration_shouldPropagateException_whenMapperFails() {
        // given
        SearchConfigurationRequest request = mock(SearchConfigurationRequest.class);
        when(databaseRepository.findFirstByIsDeletedFalseOrderByCreatedAtDesc())
                .thenReturn(Optional.empty());
        when(mapper.toModel(request)).thenThrow(new IllegalArgumentException("invalid request"));

        // when / then
        assertThatThrownBy(() -> service.updateConfiguration(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("invalid request");

        verify(databaseRepository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }
}