package com.ragflow.retrieval.mapper;

import com.ragflow.retrieval.dto.response.SearchDetailResponse;
import com.ragflow.retrieval.dto.response.SearchConfigResponse;
import com.ragflow.retrieval.entity.SearchApp;
import com.ragflow.retrieval.entity.SearchConfig;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Component
public class SearchAppMapper {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss").withZone(ZoneOffset.UTC);

    public SearchDetailResponse toDetail(SearchApp entity) {
        return SearchDetailResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(Optional.ofNullable(entity.getDescription()).orElse(""))
                .avatar(Optional.ofNullable(entity.getAvatar()).orElse(""))
                .status(entity.getStatus())
                .tenantId(entity.getTenantId())
                .createdBy(entity.getCreatedBy())
                .createTime(entity.getCreateTime())
                .updateTime(entity.getUpdateTime())
                .createDate(formatEpochMillis(entity.getCreateTime()))
                .updateDate(formatEpochMillis(entity.getUpdateTime()))
                .searchConfig(toConfigResponse(entity.getSearchConfig()))
                .build();
    }

    private SearchConfigResponse toConfigResponse(SearchConfig config) {
        return SearchConfigResponse.builder()
                .kbIds(config.getKbIds())
                .docIds(config.getDocIds())
                .similarityThreshold(config.getSimilarityThreshold())
                .vectorSimilarityWeight(config.getVectorSimilarityWeight())
                .topK(config.getTopK())
                .keyword(config.getKeyword())
                .highlight(config.getHighlight())
                .useKg(config.getUseKg())
                .webSearch(config.getWebSearch())
                .summary(config.getSummary())
                .relatedSearch(config.getRelatedSearch())
                .queryMindmap(config.getQueryMindmap())
                .rerankId(config.getRerankId())
                .chatId(config.getChatId())
                .chatSettingCrossLanguages(config.getChatSettingCrossLanguages())
                .metaDataFilter(config.getMetaDataFilter())
                .referenceMetadata(config.getReferenceMetadata() == null ? null :
                        SearchConfigResponse.ReferenceMetadataResponse.builder()
                                .include(config.getReferenceMetadata().getInclude())
                                .build())
                .llmSetting(config.getLlmSetting())
                .build();
    }

    private String formatEpochMillis(Long epochMillis) {
        if (epochMillis == null) {
            return null;
        }
        return DATE_FORMAT.format(Instant.ofEpochMilli(epochMillis));
    }
}
