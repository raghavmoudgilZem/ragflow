package com.ragflow.retrieval.service.impl;

import com.ragflow.retrieval.dto.request.SearchAppCreateRequest;
import com.ragflow.retrieval.dto.response.SearchPageResponse;
import com.ragflow.retrieval.dto.response.SearchDetailResponse;
import com.ragflow.retrieval.entity.SearchApp;
import com.ragflow.retrieval.entity.SearchAppStatus;
import com.ragflow.retrieval.entity.SearchConfig;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.exception.RetrievalException;
import com.ragflow.retrieval.exception.ResourceNotFoundException;
import com.ragflow.retrieval.mapper.SearchAppMapper;
import com.ragflow.retrieval.repository.SearchRepository;
import com.ragflow.retrieval.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final SearchRepository searchAppRepository;
    private final SearchAppMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public SearchPageResponse<SearchDetailResponse> getSearchList(String keywords, int page, int pageSize) {
//        String tenantId = TenantContext.getTenantId();
        String tenantId = "57d33c34688611f1bd79b731f087cec0";
        String normalizedKeywords = keywords == null ? "" : keywords.trim();

        int safePage = Math.max(page, 1);
        int safePageSize = Math.min(Math.max(pageSize, 1), 200);

        Page<SearchApp> result = searchAppRepository.findAllByTenantAndKeywords(
                tenantId,
                SearchAppStatus.ACTIVE.getCode(),
                normalizedKeywords,
                PageRequest.of(safePage - 1, safePageSize));

        return new SearchPageResponse<SearchDetailResponse>(result.getContent().stream()
                .map(mapper::toDetail)
                .toList(), result.getTotalElements());
    }

    @Override
    @Transactional
    public String create(SearchAppCreateRequest request) {
//        String tenantId = TenantContext.getTenantId();
//        String userId = TenantContext.getUserId();

        String tenantId = "57d33c34688611f1bd79b731f087cec0";
        String userId = "57d33c34688611f1bd79b731f087cec0";

        String name = request.getName().trim();

        if (searchAppRepository.existsByTenantIdAndNameAndStatus(tenantId, name, SearchAppStatus.ACTIVE.getCode())) {
            throw new BusinessException(ErrorCode.SEARCH_DUPLICATION_ERROR);
        }

        long now = Instant.now().toEpochMilli();
        LocalDateTime localNow = LocalDateTime.now();

        SearchApp entity = SearchApp.builder()
                .tenantId(tenantId)
                .name(name)
                .description("")
                .avatar(null)
                .status(SearchAppStatus.ACTIVE.getCode())
                .searchConfig(SearchConfig.withDefaults())
                .createdBy(userId)
                .createTime(now)
                .updateTime(now)
                .createDate(localNow)
                .updateDate(localNow)
                .build();

        SearchApp saved = searchAppRepository.save(entity);
        log.info("Created search app {} for tenant {}", saved.getId(), tenantId);

        return saved.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public SearchDetailResponse getById(String id) {
        return mapper.toDetail(loadOwnedActiveEntity(id));
    }

    @Override
    @Transactional
    public void delete(String searchId) {
//        String tenantId = TenantContext.getTenantId();
        String tenantId = "57d33c34688611f1bd79b731f087cec0";
        SearchApp entity = loadOwnedActiveEntity(searchId);
        entity.setStatus(SearchAppStatus.DELETED.getCode());
        entity.setUpdateTime(Instant.now().toEpochMilli());
        searchAppRepository.save(entity);
        log.info("Soft-deleted search app {} for tenant {}", searchId, tenantId);
    }

    private SearchApp loadOwnedActiveEntity(String id) {
//        String tenantId = TenantContext.getTenantId();
        String tenantId = "57d33c34688611f1bd79b731f087cec0";
        return searchAppRepository.findByIdAndTenantIdAndStatus(id, tenantId, SearchAppStatus.ACTIVE.getCode())
                .orElseThrow(() -> new ResourceNotFoundException("Search app not found: " + id));
    }

}
