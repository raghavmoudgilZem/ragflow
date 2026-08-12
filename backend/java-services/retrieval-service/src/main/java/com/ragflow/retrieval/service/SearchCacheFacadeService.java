package com.ragflow.retrieval.service;

import com.ragflow.retrieval.cache.CacheKeyBuilder;
import com.ragflow.retrieval.dto.request.SearchRequest;
import com.ragflow.retrieval.dto.response.SearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class SearchCacheFacadeService {

    private final CacheKeyBuilder cacheKeyBuilder;
    private final RedisCacheService cacheService;

    public SearchCacheFacadeService(CacheKeyBuilder cacheKeyBuilder, RedisCacheService cacheService) {
        this.cacheKeyBuilder = cacheKeyBuilder;
        this.cacheService = cacheService;
    }

    public SearchResponse search(SearchRequest request) {
        log.info("search request :{} for tenant id :{}",request,request.getTenantId());
        String key = cacheKeyBuilder.build(request);
        log.info("search key :{} for tenant id :{}",key,request.getTenantId());
        Optional<SearchResponse> cached = cacheService.get(key, SearchResponse.class);
        if (cached.isPresent()) {
            log.info("cache hit found for calculated query key: {}", key);
            return cached.get();
        }
        log.info("cache miss for calculated query key: {}", key);
         // here call actual search logic service if cache miss
        // below we are storing dummy data to check redis functionality once actual logic implemented remove Dummy data.
        SearchResponse searchResponse = SearchResponse.builder()
                .total(1L)
                .chunks(List.of(
                        Map.of(
                                "id", "chunk-1",
                                "content", "Redis improves search performance by caching search results.",
                                "score", 0.95
                        )
                ))
                .docAggs(List.of(
                        Map.of(
                                "documentId", "doc-1",
                                "documentName", "Redis Guide"
                        )
                ))
                .build();
        if(searchResponse!=null){
            this.cacheService.set(key, searchResponse, Duration.ofMinutes(5));
        }
        return searchResponse;
    }
}
