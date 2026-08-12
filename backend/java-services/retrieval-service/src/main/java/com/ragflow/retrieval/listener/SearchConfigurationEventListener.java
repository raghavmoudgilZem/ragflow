package com.ragflow.retrieval.listener;

import com.ragflow.retrieval.cache.SearchConfigurationCache;
import com.ragflow.retrieval.entity.SearchConfiguration;
import com.ragflow.retrieval.event.SearchConfigurationUpdatedEvent;
import com.ragflow.retrieval.pubsub.SearchConfigurationPublisher;
import com.ragflow.retrieval.repository.SearchConfigurationCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class SearchConfigurationEventListener {

    private final SearchConfigurationCacheRepository redisRepository;
    private final SearchConfigurationCache localCache;
    private final SearchConfigurationPublisher publisher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void synchronizeCaches(SearchConfigurationUpdatedEvent event) {
        SearchConfiguration configuration = event.configuration();
        log.info("Transaction committed. Synchronizing caches.");
        redisRepository.save(configuration);
        localCache.update(configuration);
        publisher.publish(configuration);
        log.info("Search configuration cache synchronized after transaction commit.");
    }
}
