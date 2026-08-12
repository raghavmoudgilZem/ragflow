package com.ragflow.retrieval.cache;

import com.ragflow.retrieval.dto.request.SearchRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Component;

import java.util.TreeMap;
import java.util.stream.Collectors;

@Component
@Slf4j
public class CacheKeyBuilder {

    public String build(SearchRequest request) {
       log.info("building cache key for tenant id :{}",request.getTenantId());
        StringBuilder sb = new StringBuilder();

        String normalizedQuery = request.getQuery() != null ? request.getQuery().trim().toLowerCase() : "";
        sb.append("q:").append(normalizedQuery).append("|");

        // 2. Deterministically Sort Tenant IDs List
        if (request.getTenantId() != null) {
            sb.append("t:").append(request.getTenantId()).append("|");
        }

        // 3. Deterministically Sort KB IDs List
        if (request.getKbIds() != null) {
            String sortedKbs = request.getKbIds().stream()
                    .sorted()
                    .collect(Collectors.joining(","));
            sb.append("kb:").append(sortedKbs).append("|");
        }

        // 4. Deterministically Sort Filters using a TreeMap
        if (request.getFilters() != null && !request.getFilters().isEmpty()) {
            TreeMap<String, Object> sortedFilters = new TreeMap<>(request.getFilters());
            sb.append("f:").append(sortedFilters.toString()).append("|");
        }

        // 5. Generate SHA-256 Hex Hash
        String key = DigestUtils.sha256Hex(sb.toString());
        log.info("cache key generated successfully for tenant id :{}",request.getTenantId());
        return  key;
    }
}
