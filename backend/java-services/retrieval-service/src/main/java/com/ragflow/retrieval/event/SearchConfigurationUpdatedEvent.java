package com.ragflow.retrieval.event;

import com.ragflow.retrieval.entity.SearchConfiguration;

public record SearchConfigurationUpdatedEvent(
        SearchConfiguration configuration
) {
}
