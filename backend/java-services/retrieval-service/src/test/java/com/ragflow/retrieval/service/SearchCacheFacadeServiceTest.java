package com.ragflow.retrieval.service;


import com.ragflow.retrieval.cache.CacheKeyBuilder;
import com.ragflow.retrieval.dto.request.SearchRequest;
import com.ragflow.retrieval.dto.response.SearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchCacheFacadeServiceTest {

    @Mock
    private CacheKeyBuilder cacheKeyBuilder;

    @Mock
    private RedisCacheService cacheService;

    @InjectMocks
    private SearchCacheFacadeService searchCacheFacadeService;

    private SearchRequest mockRequest;
    private final String mockCacheKey = "search_result:test_hash_123";

    @BeforeEach
    void setUp() {
        // Setup a reusable baseline request object mapping to your DTO structure
        mockRequest = new SearchRequest();
        mockRequest.setQuery("what is redis caching");
        mockRequest.setTenantId("tenant_001");
        mockRequest.setKbIds(List.of("kb-abc"));
        mockRequest.setFilters(Collections.emptyMap());
    }

    @Test
    @DisplayName("Should return cached response immediately when cache hit occurs")
    void shouldReturnCachedResponseOnCacheHit() {
        // --- 1. ARRANGE ---
        SearchResponse expectedCachedResponse = SearchResponse.builder()
                .total(42L)
                .chunks(List.of(Map.of("id", "cached-chunk", "content", "Old Cached Data", "score", 0.99)))
                .docAggs(List.of(Map.of("documentId", "doc-old", "documentName", "Cached Guide")))
                .build();

        // Instruct mocks to simulate a direct cache hit scenario
        when(cacheKeyBuilder.build(mockRequest)).thenReturn(mockCacheKey);
        when(cacheService.get(mockCacheKey, SearchResponse.class)).thenReturn(Optional.of(expectedCachedResponse));

        // --- 2. ACT ---
        SearchResponse actualResponse = searchCacheFacadeService.search(mockRequest);

        // --- 3. ASSERT ---
        assertNotNull(actualResponse, "Response should not be null on cache hit");
        assertEquals(42L, actualResponse.getTotal(), "Should return the exact total from cache");
        assertEquals("cached-chunk", actualResponse.getChunks().get(0).get("id"));

        // Meticulously verify that the service NEVER attempted to overwrite or write back data on a hit
        verify(cacheService, never()).set(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should generate dummy response and save it to Redis when cache miss occurs")
    void shouldGenerateAndCacheResponseOnCacheMiss() {
        // --- 1. ARRANGE ---
        // Instruct mocks to simulate a cache miss scenario
        when(cacheKeyBuilder.build(mockRequest)).thenReturn(mockCacheKey);
        when(cacheService.get(mockCacheKey, SearchResponse.class)).thenReturn(Optional.empty());

        // --- 2. ACT ---
        SearchResponse actualResponse = searchCacheFacadeService.search(mockRequest);

        // --- 3. ASSERT ---
        assertNotNull(actualResponse, "Response should be generated even on cache miss");

        // Assertions matching your explicit fallback dummy structural data exactly
        assertEquals(1L, actualResponse.getTotal());
        assertEquals("chunk-1", actualResponse.getChunks().get(0).get("id"));
        assertEquals("Redis Guide", actualResponse.getDocAggs().get(0).get("documentName"));

        // Verify the system successfully performed a safe write-back to Redis with a 5-minute TTL window
        verify(cacheService, times(1)).set(
                eq(mockCacheKey),
                any(SearchResponse.class),
                eq(Duration.ofMinutes(5))
        );
    }
}
