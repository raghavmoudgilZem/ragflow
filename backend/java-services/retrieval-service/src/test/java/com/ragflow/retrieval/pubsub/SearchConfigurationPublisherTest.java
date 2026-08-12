package com.ragflow.retrieval.pubsub;

import com.ragflow.retrieval.constants.RedisConstants;
import com.ragflow.retrieval.entity.SearchConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("SearchConfigurationPublisher Tests")
class SearchConfigurationPublisherTest {

    @Mock
    private RedisTemplate<String, SearchConfiguration> redisTemplate;

    @InjectMocks
    private SearchConfigurationPublisher publisher;

    @Test
    @DisplayName("should publish configuration update to Redis channel")
    void shouldPublishConfigurationUpdate() {
        // Arrange
        SearchConfiguration configuration = SearchConfiguration.builder()
                .similarityThreshold(0.75)
                .keywordWeight(0.30)
                .semanticWeight(0.70)
                .build();

        // Act
        publisher.publish(configuration);

        // Assert
        verify(redisTemplate).convertAndSend(
                RedisConstants.SEARCH_CONFIGURATION_CHANNEL,
                configuration
        );
        verifyNoMoreInteractions(redisTemplate);
    }
}
