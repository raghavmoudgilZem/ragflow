package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.request.SearchAppCreateRequest;
import com.ragflow.retrieval.dto.response.SearchDetailResponse;
import com.ragflow.retrieval.dto.response.SearchPageResponse;
import com.ragflow.retrieval.entity.SearchApp;
import com.ragflow.retrieval.entity.SearchAppStatus;
import com.ragflow.retrieval.entity.SearchConfig;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ResourceNotFoundException;
import com.ragflow.retrieval.mapper.SearchAppMapper;
import com.ragflow.retrieval.repository.SearchRepository;
import com.ragflow.retrieval.service.impl.SearchServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceImplTest {

    private static final String TENANT_ID = "57d33c34688611f1bd79b731f087cec0";

    @Mock
    private SearchRepository searchAppRepository;

    @Mock
    private SearchAppMapper mapper;

    @InjectMocks
    private SearchServiceImpl service;

    private SearchApp buildEntity(String id) {
        return SearchApp.builder()
                .id(id)
                .tenantId(TENANT_ID)
                .name("my search app")
                .description("")
                .status(SearchAppStatus.ACTIVE.getCode())
                .searchConfig(SearchConfig.withDefaults())
                .createdBy(TENANT_ID)
                .createTime(1L)
                .updateTime(1L)
                .build();
    }

    // ---- getSearchList ----

    @Test
    void shouldReturnPagedSearchList() {
        SearchApp entity = buildEntity("app-1");
        SearchDetailResponse detail = SearchDetailResponse.builder().id("app-1").name("my search app").build();

        when(searchAppRepository.findAllByTenantAndKeywords(
                eq(TENANT_ID), eq(SearchAppStatus.ACTIVE.getCode()), eq("abc"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(entity)));
        when(mapper.toDetail(entity)).thenReturn(detail);

        SearchPageResponse<SearchDetailResponse> result = service.getSearchList("abc", 1, 50);

        assertEquals(1, result.getItems().size());
        assertEquals("app-1", result.getItems().get(0).getId());
        assertEquals(1, result.getTotalItems());
    }

    @Test
    void shouldNormalizeNullKeywordsToEmptyString() {
        when(searchAppRepository.findAllByTenantAndKeywords(
                eq(TENANT_ID), eq(SearchAppStatus.ACTIVE.getCode()), eq(""), any(Pageable.class)))
                .thenReturn(Page.empty());

        SearchPageResponse<SearchDetailResponse> result = service.getSearchList(null, 1, 50);

        assertEquals(0, result.getItems().size());
    }

    @Test
    void shouldTrimKeywords() {
        when(searchAppRepository.findAllByTenantAndKeywords(
                eq(TENANT_ID), eq(SearchAppStatus.ACTIVE.getCode()), eq("abc"), any(Pageable.class)))
                .thenReturn(Page.empty());

        service.getSearchList("  abc  ", 1, 50);

        verify(searchAppRepository).findAllByTenantAndKeywords(
                eq(TENANT_ID), eq(SearchAppStatus.ACTIVE.getCode()), eq("abc"), any(Pageable.class));
    }

    @Test
    void shouldClampPageToMinimumOneWhenPageIsZeroOrNegative() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        when(searchAppRepository.findAllByTenantAndKeywords(anyString(), anyString(), anyString(), captor.capture()))
                .thenReturn(Page.empty());

        service.getSearchList("", 0, 50);
        service.getSearchList("", -5, 50);

        for (Pageable pageable : captor.getAllValues()) {
            assertEquals(0, pageable.getPageNumber());
        }
    }

    @Test
    void shouldClampPageSizeToMaximumOf200() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        when(searchAppRepository.findAllByTenantAndKeywords(anyString(), anyString(), anyString(), captor.capture()))
                .thenReturn(Page.empty());

        service.getSearchList("", 1, 5000);

        assertEquals(200, captor.getValue().getPageSize());
    }

    @Test
    void shouldClampPageSizeToMinimumOfOne() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        when(searchAppRepository.findAllByTenantAndKeywords(anyString(), anyString(), anyString(), captor.capture()))
                .thenReturn(Page.empty());

        service.getSearchList("", 1, 0);

        assertEquals(1, captor.getValue().getPageSize());
    }

    // ---- create ----

    @Test
    void shouldCreateSearchAppSuccessfully() {
        SearchAppCreateRequest request = new SearchAppCreateRequest();
        request.setName("my search app");

        when(searchAppRepository.existsByTenantIdAndNameAndStatus(TENANT_ID, "my search app", SearchAppStatus.ACTIVE.getCode()))
                .thenReturn(false);
        when(searchAppRepository.save(any(SearchApp.class))).thenAnswer(invocation -> {
            SearchApp saved = invocation.getArgument(0);
            saved.setId("generated-id");
            return saved;
        });

        String id = service.create(request);

        assertEquals("generated-id", id);

        ArgumentCaptor<SearchApp> captor = ArgumentCaptor.forClass(SearchApp.class);
        verify(searchAppRepository).save(captor.capture());
        SearchApp persisted = captor.getValue();
        assertEquals(TENANT_ID, persisted.getTenantId());
        assertEquals("my search app", persisted.getName());
        assertEquals(SearchAppStatus.ACTIVE.getCode(), persisted.getStatus());
    }

    @Test
    void shouldTrimNameWhenCreating() {
        SearchAppCreateRequest request = new SearchAppCreateRequest();
        request.setName("  padded name  ");

        when(searchAppRepository.existsByTenantIdAndNameAndStatus(TENANT_ID, "padded name", SearchAppStatus.ACTIVE.getCode()))
                .thenReturn(false);
        when(searchAppRepository.save(any(SearchApp.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(request);

        ArgumentCaptor<SearchApp> captor = ArgumentCaptor.forClass(SearchApp.class);
        verify(searchAppRepository).save(captor.capture());
        assertEquals("padded name", captor.getValue().getName());
    }

    @Test
    void shouldThrowConflictWhenNameAlreadyExists() {
        SearchAppCreateRequest request = new SearchAppCreateRequest();
        request.setName("duplicate");

        when(searchAppRepository.existsByTenantIdAndNameAndStatus(TENANT_ID, "duplicate", SearchAppStatus.ACTIVE.getCode()))
                .thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request));
        verify(searchAppRepository, never()).save(any());
    }

    // ---- getById ----

    @Test
    void shouldReturnDetailWhenFound() {
        SearchApp entity = buildEntity("app-1");
        SearchDetailResponse detail = SearchDetailResponse.builder().id("app-1").build();

        when(searchAppRepository.findByIdAndTenantIdAndStatus("app-1", TENANT_ID, SearchAppStatus.ACTIVE.getCode()))
                .thenReturn(Optional.of(entity));
        when(mapper.toDetail(entity)).thenReturn(detail);

        SearchDetailResponse result = service.getById("app-1");

        assertEquals("app-1", result.getId());
    }

    @Test
    void shouldThrowNotFoundWhenGetByIdMissing() {
        when(searchAppRepository.findByIdAndTenantIdAndStatus("missing", TENANT_ID, SearchAppStatus.ACTIVE.getCode()))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getById("missing"));
    }

    // ---- delete ----

    @Test
    void shouldSoftDeleteByFlippingStatus() {
        SearchApp entity = buildEntity("app-1");

        when(searchAppRepository.findByIdAndTenantIdAndStatus("app-1", TENANT_ID, SearchAppStatus.ACTIVE.getCode()))
                .thenReturn(Optional.of(entity));
        when(searchAppRepository.save(any(SearchApp.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.delete("app-1");

        ArgumentCaptor<SearchApp> captor = ArgumentCaptor.forClass(SearchApp.class);
        verify(searchAppRepository, times(1)).save(captor.capture());
        assertEquals(SearchAppStatus.DELETED.getCode(), captor.getValue().getStatus());
    }

    @Test
    void shouldThrowNotFoundWhenDeletingMissingEntity() {
        when(searchAppRepository.findByIdAndTenantIdAndStatus("missing", TENANT_ID, SearchAppStatus.ACTIVE.getCode()))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete("missing"));
        verify(searchAppRepository, never()).save(any());
    }
}
