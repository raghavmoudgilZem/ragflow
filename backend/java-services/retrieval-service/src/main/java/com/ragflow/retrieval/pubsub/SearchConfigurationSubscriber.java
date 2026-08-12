package com.ragflow.retrieval.pubsub;

import com.ragflow.retrieval.cache.SearchConfigurationCache;
import com.ragflow.retrieval.entity.SearchConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SearchConfigurationSubscriber {
    private final SearchConfigurationCache cache;
    public void receive(SearchConfiguration message) {
        try {
            log.info("Received search configuration update from Redis.");
            log.debug("Received configuration: {}", message);
            cache.update(message);
            log.debug("Local search configuration cache updated successfully.");
        } catch (Exception ex) {
            log.error("Failed to process search configuration update from Redis.", ex);
            throw ex;
        }
    }
}