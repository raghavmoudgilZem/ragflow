package com.ragflow.retrieval.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SearchConfig {

    @Builder.Default
    @JsonProperty("kb_ids")
    private List<String> kbIds = List.of();

    @Builder.Default
    @JsonProperty("doc_ids")
    private List<String> docIds = List.of();

    @Builder.Default
    @JsonProperty("similarity_threshold")
    private Double similarityThreshold = 0.2;

    @Builder.Default
    @JsonProperty("vector_similarity_weight")
    private Double vectorSimilarityWeight = 0.3;

    @Builder.Default
    @JsonProperty("top_k")
    private Integer topK = 1024;

    @Builder.Default
    private Boolean keyword = false;

    @Builder.Default
    private Boolean highlight = false;

    @Builder.Default
    @JsonProperty("use_kg")
    private Boolean useKg = false;

    @Builder.Default
    @JsonProperty("web_search")
    private Boolean webSearch = false;

    @Builder.Default
    private Boolean summary = false;

    @Builder.Default
    @JsonProperty("related_search")
    private Boolean relatedSearch = false;

    @Builder.Default
    @JsonProperty("query_mindmap")
    private Boolean queryMindmap = false;

    @Builder.Default
    @JsonProperty("rerank_id")
    private String rerankId = "";

    @Builder.Default
    @JsonProperty("chat_id")
    private String chatId = "";

    @Builder.Default
    @JsonProperty("chat_settingcross_languages")
    private List<String> chatSettingCrossLanguages = List.of();

    @Builder.Default
    @JsonProperty("meta_data_filter")
    private Map<String, Object> metaDataFilter = new HashMap<>();

    @Builder.Default
    @JsonProperty("reference_metadata")
    private ReferenceMetadata referenceMetadata = ReferenceMetadata.builder().include(false).build();

    @Builder.Default
    @JsonProperty("llm_setting")
    private Map<String, Object> llmSetting = new HashMap<>();

    public static SearchConfig withDefaults() {
        return SearchConfig.builder().build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReferenceMetadata {
        @Builder.Default
        private Boolean include = false;
    }
}
