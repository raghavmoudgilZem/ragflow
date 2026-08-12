package com.ragflow.retrieval.service;


import com.ragflow.retrieval.dto.request.SearchAppCreateRequest;
import com.ragflow.retrieval.dto.response.SearchPageResponse;
import com.ragflow.retrieval.dto.response.SearchDetailResponse;

public interface SearchService {

    SearchPageResponse<SearchDetailResponse> getSearchList(String keywords, int page, int pageSize);

    String create(SearchAppCreateRequest request);

    SearchDetailResponse getById(String id);

    void delete(String searchId);
}
