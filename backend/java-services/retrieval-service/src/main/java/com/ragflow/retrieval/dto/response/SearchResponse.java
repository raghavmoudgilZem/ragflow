package com.ragflow.retrieval.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {
    private  Long total;
    private List<Map<String, Object>> chunks;
    private List<Map<String, Object>> docAggs;
}
