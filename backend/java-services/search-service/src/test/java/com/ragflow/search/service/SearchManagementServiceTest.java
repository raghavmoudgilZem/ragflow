package com.ragflow.search.service;

import com.ragflow.search.dto.request.CreateSearchRequest;
import com.ragflow.search.dto.request.SearchListRequest;
import com.ragflow.search.dto.response.SearchDetailResponse;
import com.ragflow.search.dto.response.SearchListResponse;
import com.ragflow.search.entity.Search;
import com.ragflow.search.entity.User;
import com.ragflow.search.repository.SearchRepository;
import com.ragflow.search.repository.UserRepository;
import com.ragflow.search.service.impl.SearchManagementServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SearchManagementService — Day 2 Tests (5 Python methods)")
class SearchManagementServiceTest {

    @Mock private SearchRepository searchRepository;
    @Mock private UserRepository userRepository;

    // Updated to inject into the concrete implementation class
    @InjectMocks private SearchManagementServiceImpl service;

    private static final String SEARCH_ID  = "search-uuid-001";
    private static final String TENANT_ID  = "tenant-uuid-001";
    private static final String USER_ID    = "user-uuid-001";
    private static final String OTHER_USER = "user-uuid-999";

    private Search buildSearch() {
        return Search.builder()
                .id(SearchManagementServiceTest.SEARCH_ID).tenantId(TENANT_ID).createdBy(USER_ID)
                .name("AWS Search").description("AWS docs")
                .avatar("avatar.png").searchConfig("{\"mode\":\"hybrid\"}")
                .status(1)
                .createTime(System.currentTimeMillis())
                .updateTime(System.currentTimeMillis())
                .build();
    }

    private User buildUser() {
        User u = new User();
        u.setId(TENANT_ID); u.setNickname("John Doe");
        u.setAvatar("user-avatar.png"); u.setStatus(1);
        return u;
    }

    // ── METHOD 1: save() ─────────────────────────────────────────────────────
    @Nested
    @DisplayName("Method 1: save() — Python save(**kwargs)")
    class SaveTests {

        @Test
        @DisplayName("✅ Creates search with status=1 and auto timestamps")
        void save_createsWithValidStatusAndTimestamps() {
            CreateSearchRequest req = new CreateSearchRequest(
                    "My AWS Search",
                    "AWS docs",
                    "avatar.png",
                    "{\"mode\":\"hybrid\"}"
            );

            Search saved = buildSearch();
            when(searchRepository.save(any(Search.class))).thenReturn(saved);

            SearchDetailResponse res = service.save(req, TENANT_ID, USER_ID);

            assertThat(res).isNotNull();
            assertThat(res.id()).isEqualTo(SEARCH_ID);
            assertThat(res.tenantId()).isEqualTo(TENANT_ID);
            assertThat(res.createdBy()).isEqualTo(USER_ID);

            verify(searchRepository).save(argThat(s ->
                    s.getStatus() == 1 &&
                            s.getTenantId().equals(TENANT_ID) &&
                            s.getCreatedBy().equals(USER_ID)
            ));
        }

        @Test
        @DisplayName("✅ Stores searchConfig JSON string as-is")
        void save_storesSearchConfigAsIs() {
            String config = "{\"mode\":\"hybrid\",\"topK\":10}";
            CreateSearchRequest req = new CreateSearchRequest("Test", null, null, config);

            Search saved = buildSearch();
            saved.setSearchConfig(config);
            when(searchRepository.save(any())).thenReturn(saved);

            SearchDetailResponse res = service.save(req, TENANT_ID, USER_ID);

            assertThat(res.searchConfig()).isEqualTo(config);
        }

        @Test
        @DisplayName("✅ Returns null nickname and tenantAvatar when no user provided")
        void save_returnsNullUserFields() {
            CreateSearchRequest req = new CreateSearchRequest("Test", null, null, null);
            when(searchRepository.save(any())).thenReturn(buildSearch());

            SearchDetailResponse res = service.save(req, TENANT_ID, USER_ID);

            assertThat(res.nickname()).isNull();
            assertThat(res.tenantAvatar()).isNull();
        }
    }

    // ── METHOD 2: accessible4deletion() ──────────────────────────────────────
    @Nested
    @DisplayName("Method 2: accessibleForDeletion() — Python accessible4deletion()")
    class AccessibleForDeletionTests {

        @Test
        @DisplayName("✅ Returns true when user owns VALID search")
        void accessible_ownerAndValid_returnsTrue() {
            when(searchRepository.findByIdAndCreatedByAndStatusValid(SEARCH_ID, USER_ID))
                    .thenReturn(Optional.of(buildSearch()));

            assertThat(service.accessibleForDeletion(SEARCH_ID, USER_ID)).isTrue();
        }

        @Test
        @DisplayName("✅ Returns false when user does not own search")
        void accessible_notOwner_returnsFalse() {
            when(searchRepository.findByIdAndCreatedByAndStatusValid(SEARCH_ID, OTHER_USER))
                    .thenReturn(Optional.empty());

            assertThat(service.accessibleForDeletion(SEARCH_ID, OTHER_USER)).isFalse();
        }

        @Test
        @DisplayName("✅ Returns false when search is INVALID (soft deleted)")
        void accessible_invalidStatus_returnsFalse() {
            when(searchRepository.findByIdAndCreatedByAndStatusValid(SEARCH_ID, USER_ID))
                    .thenReturn(Optional.empty());

            assertThat(service.accessibleForDeletion(SEARCH_ID, USER_ID)).isFalse();
        }
    }

    // ── METHOD 3: get_detail() ────────────────────────────────────────────────
    @Nested
    @DisplayName("Method 3: getDetail() — Python get_detail(search_id)")
    class GetDetailTests {

        @Test
        @DisplayName("✅ Returns all 10 Python fields + nickname + tenantAvatar from user JOIN")
        void getDetail_returnsAllPythonFields() {
            Search s = buildSearch();
            User u = buildUser();

            when(searchRepository.findByIdAndStatusValid(SEARCH_ID)).thenReturn(Optional.of(s));
            when(userRepository.findByIdAndStatusValid(TENANT_ID)).thenReturn(Optional.of(u));

            SearchDetailResponse res = service.getDetail(SEARCH_ID);

            assertThat(res.id()).isEqualTo(SEARCH_ID);
            assertThat(res.avatar()).isEqualTo("avatar.png");
            assertThat(res.tenantId()).isEqualTo(TENANT_ID);
            assertThat(res.name()).isEqualTo("AWS Search");
            assertThat(res.description()).isEqualTo("AWS docs");
            assertThat(res.createdBy()).isEqualTo(USER_ID);
            assertThat(res.searchConfig()).isEqualTo("{\"mode\":\"hybrid\"}");
            assertThat(res.updateTime()).isNotNull();
            assertThat(res.nickname()).isEqualTo("John Doe");
            assertThat(res.tenantAvatar()).isEqualTo("user-avatar.png");
        }

        @Test
        @DisplayName("✅ Throws 403 when search not found — Python returns {}")
        void getDetail_notFound_throws403() {
            when(searchRepository.findByIdAndStatusValid("bad-id")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.getDetail("bad-id"))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> assertThat(
                            ((ResponseStatusException) ex).getStatusCode().value()).isEqualTo(403));
        }

        @Test
        @DisplayName("✅ Returns null user fields when tenant user is INVALID")
        void getDetail_invalidTenantUser_returnsNullFields() {
            when(searchRepository.findByIdAndStatusValid(SEARCH_ID))
                    .thenReturn(Optional.of(buildSearch()));
            when(userRepository.findByIdAndStatusValid(TENANT_ID)).thenReturn(Optional.empty());

            SearchDetailResponse res = service.getDetail(SEARCH_ID);

            assertThat(res.nickname()).isNull();
            assertThat(res.tenantAvatar()).isNull();
        }
    }

    // ── METHOD 4: get_by_tenant_ids() ────────────────────────────────────────
    @Nested
    @DisplayName("Method 4: getByTenantIds() — Python get_by_tenant_ids()")
    class GetByTenantIdsTests {

        @Test
        @DisplayName("✅ Converts Python 1-based page to Spring 0-based correctly")
        void list_convertsPageNumberCorrectly() {
            SearchListRequest req = new SearchListRequest(
                    List.of(TENANT_ID), 2, 5, "update_time", true, null
            );

            Page<Search> page = new PageImpl<>(List.of(), PageRequest.of(1, 5), 10);
            when(searchRepository.findByTenantIdsAndKeywords(anyList(), any(), any(), any()))
                    .thenReturn(page);

            service.getByTenantIds(req, USER_ID);

            // Python page 2 → Spring page index 1
            verify(searchRepository).findByTenantIdsAndKeywords(
                    anyList(), any(), any(),
                    argThat(p -> p.getPageNumber() == 1 && p.getPageSize() == 5));
        }

        @Test
        @DisplayName("✅ Applies DESC sort — Python: order_by(field.desc())")
        void list_descSort_appliedCorrectly() {
            SearchListRequest req = new SearchListRequest(
                    List.of(TENANT_ID), 1, 10, "update_time", true, null
            );

            when(searchRepository.findByTenantIdsAndKeywords(anyList(), any(), any(), any()))
                    .thenReturn(new PageImpl<>(List.of()));

            service.getByTenantIds(req, USER_ID);

            verify(searchRepository).findByTenantIdsAndKeywords(
                    anyList(), any(), any(),
                    argThat(p -> Objects.requireNonNull(p.getSort().getOrderFor("update_time"))
                            .getDirection().isDescending()));
        }

        @Test
        @DisplayName("✅ Applies keyword filter — Python LOWER(name) LIKE LOWER(?)")
        void list_keywordFilter_passedToRepository() {
            SearchListRequest req = new SearchListRequest(
                    List.of(TENANT_ID), 1, 10, "update_time", false, "  aws  "
            );

            when(searchRepository.findByTenantIdsAndKeywords(
                    anyList(), any(), eq("aws"), any()))
                    .thenReturn(new PageImpl<>(List.of()));

            service.getByTenantIds(req, USER_ID);

            verify(searchRepository).findByTenantIdsAndKeywords(
                    anyList(), any(), eq("aws"), any());
        }

        @Test
        @DisplayName("✅ Joins user data — Python User.nickname + User.avatar.alias()")
        void list_joinsUserData() {
            SearchListRequest req = new SearchListRequest(
                    List.of(TENANT_ID), 1, 10, "update_time", false, null
            );

            Search s = buildSearch();
            User u = buildUser();

            when(searchRepository.findByTenantIdsAndKeywords(anyList(), any(), any(), any()))
                    .thenReturn(new PageImpl<>(List.of(s), PageRequest.of(0, 10), 1));
            when(userRepository.findAllByIdInAndStatusValid(anyList())).thenReturn(List.of(u));

            SearchListResponse res = service.getByTenantIds(req, USER_ID);

            assertThat(res.items()).hasSize(1);
            assertThat(res.items().getFirst().nickname()).isEqualTo("John Doe");
            assertThat(res.items().getFirst().tenantAvatar()).isEqualTo("user-avatar.png");
        }

        @Test
        @DisplayName("✅ Returns correct total count — Python query.count()")
        void list_returnsCorrectTotal() {
            SearchListRequest req = new SearchListRequest(
                    List.of(TENANT_ID), 1, 10, "update_time", false, null
            );

            when(searchRepository.findByTenantIdsAndKeywords(anyList(), any(), any(), any()))
                    .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 42L));
            when(userRepository.findAllByIdInAndStatusValid(anyList())).thenReturn(List.of());

            SearchListResponse res = service.getByTenantIds(req, USER_ID);

            assertThat(res.total()).isEqualTo(42L);
        }
    }

    // ── Soft Delete ───────────────────────────────────────────────────────────
    @Nested
    @DisplayName("Soft Delete — status=0 (INVALID)")
    class DeleteTests {

        @Test
        @DisplayName("✅ Soft deletes by setting status=0")
        void delete_owner_setsStatusToZero() {
            Search s = buildSearch();
            when(searchRepository.findByIdAndCreatedByAndStatusValid(SEARCH_ID, USER_ID))
                    .thenReturn(Optional.of(s));
            when(searchRepository.save(any())).thenReturn(s);

            service.delete(SEARCH_ID, USER_ID);

            verify(searchRepository).save(argThat(saved -> saved.getStatus() == 0));
        }

        @Test
        @DisplayName("✅ Throws 403 when user does not own search")
        void delete_notOwner_throws403() {
            when(searchRepository.findByIdAndCreatedByAndStatusValid(SEARCH_ID, OTHER_USER))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(SEARCH_ID, OTHER_USER))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> assertThat(
                            ((ResponseStatusException) ex).getStatusCode().value()).isEqualTo(403));
        }
    }

    // ── METHOD 5: delete_by_tenant_id() ──────────────────────────────────────
    @Nested
    @DisplayName("Method 5: deleteByTenantId() — Python delete_by_tenant_id()")
    class DeleteByTenantIdTests {

        @Test
        @DisplayName("✅ Hard deletes and returns row count — Python .execute()")
        void deleteByTenantId_returnsCount() {
            when(searchRepository.deleteByTenantId(TENANT_ID)).thenReturn(5);

            int count = service.deleteByTenantId(TENANT_ID);

            assertThat(count).isEqualTo(5);
            verify(searchRepository).deleteByTenantId(TENANT_ID);
        }

        @Test
        @DisplayName("✅ Hard delete — does NOT use soft delete (no save())")
        void deleteByTenantId_isHardDelete() {
            when(searchRepository.deleteByTenantId(TENANT_ID)).thenReturn(3);

            service.deleteByTenantId(TENANT_ID);

            verify(searchRepository, never()).save(any());
        }

        @Test
        @DisplayName("✅ Returns 0 when no searches exist for tenant")
        void deleteByTenantId_noSearches_returnsZero() {
            when(searchRepository.deleteByTenantId("empty-tenant")).thenReturn(0);

            assertThat(service.deleteByTenantId("empty-tenant")).isZero();
        }
    }
}