package com.ragflow.retrieval.pubsub;

import com.ragflow.retrieval.cache.SearchConfigurationCache;
import com.ragflow.retrieval.entity.SearchConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("SearchConfigurationSubscriber Tests")
class SearchConfigurationSubscriberTest {

    @Mock
    private SearchConfigurationCache cache;

    @InjectMocks
    private SearchConfigurationSubscriber subscriber;

    @Test
    @DisplayName("should update local cache when configuration event is received")
    void shouldUpdateCacheWhenConfigurationEventIsReceived() {

        // Arrange
        SearchConfiguration configuration = SearchConfiguration.builder()
                .similarityThreshold(0.75)
                .keywordWeight(0.30)
                .semanticWeight(0.70)
                .build();

        // Act
        subscriber.receive(configuration);

        // Assert
        verify(cache).update(configuration);
        verifyNoMoreInteractions(cache);
    }
}
