package com.ragflow.retrieval.pubsub;

import com.ragflow.retrieval.constants.RedisConstants;
import com.ragflow.retrieval.entity.SearchConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class SearchConfigurationPublisher {

    private final RedisTemplate<String, Object> redisTemplate;

    public void publish(SearchConfiguration message) {
        Objects.requireNonNull(message, "Search configuration must not be null");
        log.info("Publishing search configuration update to Redis channel '{}'.", RedisConstants.SEARCH_CONFIGURATION_CHANNEL);
        log.debug("Published configuration: {}", message);
        redisTemplate.convertAndSend(RedisConstants.SEARCH_CONFIGURATION_CHANNEL, message);
    }

}
