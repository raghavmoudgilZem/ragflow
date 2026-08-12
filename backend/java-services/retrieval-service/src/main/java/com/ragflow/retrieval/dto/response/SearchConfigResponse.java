package com.ragflow.retrieval.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.Map;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SearchConfigResponse {

    @JsonProperty("kb_ids")
    private List<String> kbIds;

    @JsonProperty("doc_ids")
    private List<String> docIds;

    @JsonProperty("similarity_threshold")
    private Double similarityThreshold;

    @JsonProperty("vector_similarity_weight")
    private Double vectorSimilarityWeight;

    @JsonProperty("top_k")
    private Integer topK;

    private Boolean keyword;
    private Boolean highlight;

    @JsonProperty("use_kg")
    private Boolean useKg;

    @JsonProperty("web_search")
    private Boolean webSearch;

    private Boolean summary;

    @JsonProperty("related_search")
    private Boolean relatedSearch;

    @JsonProperty("query_mindmap")
    private Boolean queryMindmap;

    @JsonProperty("rerank_id")
    private String rerankId;

    @JsonProperty("chat_id")
    private String chatId;

    @JsonProperty("chat_settingcross_languages")
    private List<String> chatSettingCrossLanguages;

    @JsonProperty("meta_data_filter")
    private Map<String, Object> metaDataFilter;

    @JsonProperty("reference_metadata")
    private ReferenceMetadataResponse referenceMetadata;

    @JsonProperty("llm_setting")
    private Map<String, Object> llmSetting;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReferenceMetadataResponse {
        private Boolean include;
    }
}
