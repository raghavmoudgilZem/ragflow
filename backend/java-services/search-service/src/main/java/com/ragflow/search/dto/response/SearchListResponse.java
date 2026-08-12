package com.ragflow.search.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.util.List;

/**
 * Paginated list response.
 * Python: returns (list, count) tuple — mapped to this object.
 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record SearchListResponse(
        List<SearchListItem> items,
        long total,
        int page,
        int size,
        int totalPages
) {}