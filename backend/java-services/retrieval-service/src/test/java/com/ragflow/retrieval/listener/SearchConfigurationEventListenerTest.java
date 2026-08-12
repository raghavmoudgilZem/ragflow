package com.ragflow.retrieval.listener;

import com.ragflow.retrieval.cache.SearchConfigurationCache;
import com.ragflow.retrieval.entity.SearchConfiguration;
import com.ragflow.retrieval.event.SearchConfigurationUpdatedEvent;
import com.ragflow.retrieval.pubsub.SearchConfigurationPublisher;
import com.ragflow.retrieval.repository.SearchConfigurationCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchConfigurationEventListenerTest {

    @Mock
    private SearchConfigurationCacheRepository redisRepository;

    @Mock
    private SearchConfigurationCache localCache;

    @Mock
    private SearchConfigurationPublisher publisher;

    @InjectMocks
    private SearchConfigurationEventListener listener;

    private SearchConfiguration configuration;
    private SearchConfigurationUpdatedEvent event;

    @BeforeEach
    void setUp() {
        configuration = SearchConfiguration.builder()
                .id(UUID.randomUUID())
                .similarityThreshold(0.75)
                .keywordWeight(0.4)
                .semanticWeight(0.6)
                .isDeleted(false)
                .build();
        event = new SearchConfigurationUpdatedEvent(configuration);
    }

    @Test
    void synchronizeCaches_shouldUpdateRedisLocalCacheAndPublish_inOrder() {
        // when
        listener.synchronizeCaches(event);

        // then
        InOrder inOrder = inOrder(redisRepository, localCache, publisher);
        inOrder.verify(redisRepository, times(1)).save(configuration);
        inOrder.verify(localCache, times(1)).update(configuration);
        inOrder.verify(publisher, times(1)).publish(configuration);
        inOrder.verifyNoMoreInteractions();
    }

    @Test
    void synchronizeCaches_shouldPropagateException_whenRedisSaveFails() {
        // given
        doThrow(new RuntimeException("Redis unavailable"))
                .when(redisRepository).save(configuration);

        // when / then
        assertThatThrownBy(() -> listener.synchronizeCaches(event))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Redis unavailable");

        verify(localCache, never()).update(any());
        verify(publisher, never()).publish(any());
    }

    @Test
    void synchronizeCaches_shouldPropagateException_whenLocalCacheUpdateFails() {
        // given
        doThrow(new RuntimeException("Local cache error"))
                .when(localCache).update(configuration);

        // when / then
        assertThatThrownBy(() -> listener.synchronizeCaches(event))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Local cache error");

        verify(redisRepository, times(1)).save(configuration);
        verify(publisher, never()).publish(any());
    }

    @Test
    void synchronizeCaches_shouldStillAttemptPublish_afterCachesAreUpdatedSuccessfully() {
        // when
        listener.synchronizeCaches(event);

        // then
        verify(publisher, times(1)).publish(configuration);
    }
}