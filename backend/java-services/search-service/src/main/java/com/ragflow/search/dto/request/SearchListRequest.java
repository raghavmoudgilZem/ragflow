package com.ragflow.search.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.util.List;

/**
 *  Request params for GET /api/v1/searches
 * NOTE: Records can't be used directly with @ModelAttribute for
 * multi-param binding in GET requests. Use a class here if Spring
 * has binding issues, or bind manually in the controller.
 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record SearchListRequest(
        List<String> tenantIds,
        int pageNumber,
        int itemsPerPage,
        String orderBy,
        boolean desc,
        String keywords
) {
    // Compact constructor with defaults
    public SearchListRequest {
        if (pageNumber <= 0) pageNumber = 1;
        if (itemsPerPage <= 0) itemsPerPage = 10;
        if (orderBy == null || orderBy.isBlank()) orderBy = "update_time";
    }
}