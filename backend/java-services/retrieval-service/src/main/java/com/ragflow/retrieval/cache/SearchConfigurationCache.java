package com.ragflow.retrieval.cache;

import com.ragflow.retrieval.entity.SearchConfiguration;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class SearchConfigurationCache {
    private final AtomicReference<SearchConfiguration> cache = new AtomicReference<>();
    public Optional<SearchConfiguration> get() {
        return Optional.ofNullable(cache.get());
    }
    public void update(SearchConfiguration configuration) {
        Objects.requireNonNull(configuration, "Search configuration must not be null");
        cache.set(configuration);
    }
}
