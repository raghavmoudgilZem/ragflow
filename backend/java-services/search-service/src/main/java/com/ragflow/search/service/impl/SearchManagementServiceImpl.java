package com.ragflow.search.service.impl;

import com.ragflow.search.dto.request.CreateSearchRequest;
import com.ragflow.search.dto.request.SearchListRequest;
import com.ragflow.search.dto.response.SearchDetailResponse;
import com.ragflow.search.dto.response.SearchListItem;
import com.ragflow.search.dto.response.SearchListResponse;
import com.ragflow.search.entity.Search;
import com.ragflow.search.entity.User;
import com.ragflow.search.repository.SearchRepository;
import com.ragflow.search.repository.UserRepository;
import com.ragflow.search.service.SearchManagementService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchManagementServiceImpl implements SearchManagementService {

    private final SearchRepository searchRepository;
    private final UserRepository userRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // METHOD 1: save(**kwargs) — Python monolith port
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new search configuration.
     * Python: SearchService.save(**kwargs)
     * Auto-sets: create_time, update_time (Unix ms), status=1 (VALID)
     */
    @Override
    public SearchDetailResponse save(
            CreateSearchRequest request,
            String tenantId,
            String userId) {

        Search search = searchRepository.save(
                Search.builder()
                        .tenantId(tenantId)
                        .createdBy(userId)
                        .name(request.name())
                        .description(request.description())
                        .avatar(request.avatar())
                        .searchConfig(request.searchConfig())
                        .status(1)
                        .build());

        log.info("Created search: id={} tenant={} user={}", search.getId(), tenantId, userId);
        return toDetailResponse(search, null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // METHOD 2: accessible4deletion(search_id, user_id) — Python monolith port
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Python: accessible4deletion(search_id, user_id) -> bool
     * SELECT WHERE id=? AND created_by=? AND status=1
     * Returns true if user owns the search, and it is VALID.
     */
    @Override
    public boolean accessibleForDeletion(String searchId, String userId) {
        return searchRepository
                .findByIdAndCreatedByAndStatusValid(searchId, userId)
                .isPresent();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // METHOD 3: get_detail(search_id) — Python monolith port
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Python: get_detail(search_id)
     * Returns all 10 Python fields plus joined user data.
     * JOIN: User.id == search.tenant_id AND User.status == VALID
     */
    @Override
    public SearchDetailResponse getDetail(String searchId) {
        Search search = searchRepository
                .findByIdAndStatusValid(searchId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied or search not found: " + searchId));

        // JOIN with user table — Python: User.nickname, User.avatar.alias("tenant_avatar")
        User tenantUser = userRepository
                .findByIdAndStatusValid(search.getTenantId())
                .orElse(null);

        return toDetailResponse(search, tenantUser);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // METHOD 4: get_by_tenant_ids(...) — Python monolith port
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Python: get_by_tenant_ids(joined_tenant_ids, user_id,
     *           page_number, items_per_page, orderby, desc, keywords)
     * <p>
     * Pagination: Python 1-based → Spring 0-based conversion
     * Keywords:   LOWER(name) LIKE LOWER(?)  — case-insensitive
     * Sort:       dynamic field + ASC/DESC
     * Returns:    (list, count) → SearchListResponse
     */
    @Override
    public SearchListResponse getByTenantIds(
            SearchListRequest request,
            String userId) {

        // Python: if desc → order_by(field.desc()) else order_by(field.asc())
        Sort sort = request.desc()
                ? Sort.by(request.orderBy()).descending()
                : Sort.by(request.orderBy()).ascending();

        // Python page_number is 1-based — Spring is 0-based
        Pageable pageable = PageRequest.of(
                request.pageNumber() - 1,
                request.itemsPerPage(),
                sort);

        // Ensure tenantIds list is not null and commons-lang3 null-safe fallback
        List<String> tenantIds = ObjectUtils.defaultIfNull(
                request.tenantIds(), new ArrayList<>());

        // Trim keywords and convert empty/blank string to null
        String trimmedKeywords = StringUtils.trimToNull(request.keywords());

        Page<Search> page = searchRepository.findByTenantIdsAndKeywords(
                tenantIds, userId,
                trimmedKeywords,
                pageable);

        // Batch fetch users to eliminate N+1 queries
        Set<String> tenantUserIds = page.getContent().stream()
                .map(Search::getTenantId)
                .collect(Collectors.toSet());

        // Defensive merge function added to prevent duplicate key errors
        Map<String, User> userMap = userRepository
                .findAllByIdInAndStatusValid(new ArrayList<>(tenantUserIds))
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u, (u1, u2) -> u1));

        // Map to list items with joined user data
        List<SearchListItem> items = page.getContent().stream()
                .map(s -> toListItem(s, userMap.get(s.getTenantId())))
                .toList();

        // Construct Record directly without builder
        return new SearchListResponse(
                items,
                page.getTotalElements(),
                request.pageNumber(),
                request.itemsPerPage(),
                page.getTotalPages()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Soft Delete
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Soft delete — sets status=0 (INVALID).
     * First checks ownership via accessible4deletion().
     * Python StatusEnum.VALID = 1, INVALID = 0
     */
    @Override
    @Transactional
    public void delete(String searchId, String userId) {
        Search search = searchRepository
                .findByIdAndCreatedByAndStatusValid(searchId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied or search not found: " + searchId));

        // Soft delete — status = 0 (INVALID)
        search.setStatus(0);
        searchRepository.save(search);
        log.info("Soft deleted search: id={} userId={}", searchId, userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // METHOD 5: delete_by_tenant_id(tenant_id) — Python monolith port
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Python: delete_by_tenant_id(tenant_id)
     * HARD delete all searches for a tenant.
     * Returns count of deleted rows — matches Python .execute() return value.
     */
    @Override
    @Transactional
    public int deleteByTenantId(String tenantId) {
        int count = searchRepository.deleteByTenantId(tenantId);
        log.info("Hard deleted {} searches for tenant: {}", count, tenantId);
        return count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mappers
    // ─────────────────────────────────────────────────────────────────────────

    private SearchDetailResponse toDetailResponse(Search s, User user) {
        return new SearchDetailResponse(
                s.getId(),
                s.getAvatar(),
                s.getTenantId(),
                s.getName(),
                s.getDescription(),
                s.getCreatedBy(),
                s.getSearchConfig(),
                s.getUpdateTime(),
                user != null ? user.getNickname() : null,
                user != null ? user.getAvatar() : null
        );
    }

    private SearchListItem toListItem(Search s, User user) {
        return new SearchListItem(
                s.getId(),
                s.getAvatar(),
                s.getTenantId(),
                s.getName(),
                s.getDescription(),
                s.getCreatedBy(),
                s.getStatus(),
                s.getUpdateTime(),
                s.getCreateTime(),
                user != null ? user.getNickname() : null,
                user != null ? user.getAvatar() : null
        );
    }
}