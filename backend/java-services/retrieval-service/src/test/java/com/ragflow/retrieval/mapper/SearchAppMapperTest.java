package com.ragflow.retrieval.mapper;

import com.ragflow.retrieval.dto.response.SearchConfigResponse;
import com.ragflow.retrieval.dto.response.SearchDetailResponse;
import com.ragflow.retrieval.entity.SearchApp;
import com.ragflow.retrieval.entity.SearchAppStatus;
import com.ragflow.retrieval.entity.SearchConfig;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class SearchAppMapperTest {

    private final SearchAppMapper mapper = new SearchAppMapper();

    @Test
    void shouldMapEntityFieldsToDetailResponse() {
        SearchApp entity = SearchApp.builder()
                .id("app-1")
                .name("my search app")
                .description("a description")
                .avatar("avatar-data")
                .status(SearchAppStatus.ACTIVE.getCode())
                .tenantId("tenant-1")
                .createdBy("user-1")
                .createTime(1735689600000L)
                .updateTime(1783491552451L)
                .searchConfig(SearchConfig.withDefaults())
                .build();

        SearchDetailResponse result = mapper.toDetail(entity);

        assertEquals("app-1", result.getId());
        assertEquals("my search app", result.getName());
        assertEquals("my search app", result.getName());
        assertEquals("a description", result.getDescription());
        assertEquals("avatar-data", result.getAvatar());
        assertEquals(SearchAppStatus.ACTIVE.getCode(), result.getStatus());
        assertEquals("tenant-1", result.getTenantId());
        assertEquals("user-1", result.getCreatedBy());
        assertEquals(1735689600000L, result.getCreateTime());
        assertEquals(1783491552451L, result.getUpdateTime());
    }

    @Test
    void shouldMapSearchConfigFieldsIncludingNestedReferenceMetadata() {
        SearchConfig config = SearchConfig.builder()
                .kbIds(List.of("kb-1", "kb-2"))
                .docIds(List.of("doc-1"))
                .similarityThreshold(0.5)
                .vectorSimilarityWeight(0.4)
                .topK(512)
                .keyword(true)
                .highlight(true)
                .useKg(false)
                .webSearch(true)
                .summary(false)
                .relatedSearch(true)
                .queryMindmap(false)
                .rerankId("rerank-1")
                .chatId("chat-1")
                .chatSettingCrossLanguages(List.of("en", "fr"))
                .referenceMetadata(SearchConfig.ReferenceMetadata.builder().include(true).build())
                .build();

        SearchApp entity = SearchApp.builder()
                .id("app-1")
                .createTime(1L)
                .updateTime(1L)
                .searchConfig(config)
                .build();

        SearchConfigResponse response = mapper.toDetail(entity).getSearchConfig();

        assertEquals(List.of("kb-1", "kb-2"), response.getKbIds());
        assertEquals(List.of("doc-1"), response.getDocIds());
        assertEquals(0.5, response.getSimilarityThreshold());
        assertEquals(0.4, response.getVectorSimilarityWeight());
        assertEquals(512, response.getTopK());
        assertEquals(true, response.getKeyword());
        assertEquals(true, response.getHighlight());
        assertEquals("rerank-1", response.getRerankId());
        assertEquals("chat-1", response.getChatId());
        assertEquals(List.of("en", "fr"), response.getChatSettingCrossLanguages());
        assertEquals(true, response.getReferenceMetadata().getInclude());
    }

    @Test
    void shouldReturnNullFormattedDatesWhenEpochMillisAreNull() {
        SearchApp entity = SearchApp.builder()
                .id("app-1")
                .createTime(null)
                .updateTime(null)
                .searchConfig(SearchConfig.withDefaults())
                .build();

        SearchDetailResponse result = mapper.toDetail(entity);

        assertNull(result.getCreateDate());
        assertNull(result.getUpdateDate());
    }
}
