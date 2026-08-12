package com.ragflow.search.service;

import com.ragflow.search.dto.request.CreateSearchRequest;
import com.ragflow.search.dto.request.SearchListRequest;
import com.ragflow.search.dto.response.SearchDetailResponse;
import com.ragflow.search.dto.response.SearchListResponse;

public interface SearchManagementService {

    SearchDetailResponse save(CreateSearchRequest request, String tenantId, String userId);

    boolean accessibleForDeletion(String searchId, String userId);

    SearchDetailResponse getDetail(String searchId);

    SearchListResponse getByTenantIds(SearchListRequest request, String userId);

    void delete(String searchId, String userId);

    int deleteByTenantId(String tenantId);
}