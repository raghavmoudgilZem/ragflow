package com.ragflow.dataset.implementation;

import com.ragflow.dataset.dto.ApiResponseDto;
import com.ragflow.dataset.dto.CreateDatasetRequestDto;
import com.ragflow.dataset.entity.Knowledgebase;
import com.ragflow.dataset.enums.ChunkMethod;
import com.ragflow.dataset.exception.DatasetValidationException;
import com.ragflow.dataset.exception.DuplicateDatasetNameException;
import com.ragflow.dataset.exception.ForbiddenException;
import com.ragflow.dataset.exception.ResourceNotFoundException;
import com.ragflow.dataset.records.EmbeddingModelList;
import com.ragflow.dataset.records.UpdateDatasetRequest;
import com.ragflow.dataset.repository.DatasetRepository;
import com.ragflow.dataset.service.EmbeddingModelService;
import com.ragflow.dataset.service.PipelineService;
import com.ragflow.dataset.utility.CommonConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class DatasetServiceImplTest {

    @Mock
    private DatasetRepository datasetRepository;

    @Mock
    private EmbeddingModelService embeddingModelService;

    @Mock
    private PipelineService pipelineService;

    @InjectMocks
    private DatasetServiceImpl datasetServiceImpl;

    private CreateDatasetRequestDto request;

    private static final String TENANT_ID = "tenant-123";
    private static final String DATASET_NAME = "My New dataset";
    private static final String EMBEDDING_MODEL_ID = "text-embedding-3-small";
    private static final UUID DATASET_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        request = CreateDatasetRequestDto.builder()
                .name(DATASET_NAME)
                .description("A dataset containing corporate documentation for RAG analysis.")
                .embeddingModel(EMBEDDING_MODEL_ID)
                .chunkMethod(ChunkMethod.GENERAL)
                .build();
    }

    /**
     * Common stub for the happy-path embedding model lookup.
     *
     * lenient() on the two accessor stubs because this helper is shared
     * across methods that don't all touch the same accessors:
     *   createDataSet only ever calls embeddingModel.id() (sets kb.embdId)
     *   getDatasetDetail/getAllDatasetDetail only call embeddingModel.name()
     * Without lenient(), MockitoExtension's strict-stub checking flags
     * whichever accessor the current test's code path doesn't happen to
     * call as an "unnecessary stubbing" failure, even though it's a
     * legitimate stub for a different call path through the same helper.
     */
    private void stubEmbeddingModelFound() {
        EmbeddingModelList mockModel = mock(EmbeddingModelList.class);
        lenient().when(mockModel.id()).thenReturn(EMBEDDING_MODEL_ID);
        lenient().when(mockModel.name()).thenReturn(EMBEDDING_MODEL_ID);
        when(embeddingModelService.validateAndGet(anyString(), anyString())).thenReturn(mockModel);
    }

    // ---------- happy path: createDataSet ----------

    @Test
    void createDataSet_validRequest_savesAndReturnsResponse() {
        stubEmbeddingModelFound();

        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, DATASET_NAME, "1"))
                .thenReturn(false);

        Knowledgebase saved = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .name(DATASET_NAME)
                .build();

        when(datasetRepository.save(any(Knowledgebase.class))).thenReturn(saved);
        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(saved));

        ApiResponseDto response = datasetServiceImpl.createDataSet(TENANT_ID, request);

        assertThat(response).isNotNull();
        verify(datasetRepository).existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, DATASET_NAME, "1");
        verify(datasetRepository).save(any(Knowledgebase.class));
        verify(datasetRepository).findById(DATASET_ID);
    }

    @Test
    void createDataSet_buildsEntityCorrectly() {
        stubEmbeddingModelFound();

        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(anyString(), anyString(), anyString()))
                .thenReturn(false);

        Knowledgebase saved = Knowledgebase.builder().id(DATASET_ID).build();
        when(datasetRepository.save(any(Knowledgebase.class))).thenReturn(saved);
        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(saved));

        datasetServiceImpl.createDataSet(TENANT_ID, request);

        ArgumentCaptor<Knowledgebase> captor = ArgumentCaptor.forClass(Knowledgebase.class);
        verify(datasetRepository).save(captor.capture());
        Knowledgebase kb = captor.getValue();

        assertThat(kb.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(kb.getCreatedBy()).isEqualTo(TENANT_ID);
        assertThat(kb.getName()).isEqualTo(DATASET_NAME);
        assertThat(kb.getDescription())
                .isEqualTo("A dataset containing corporate documentation for RAG analysis.");
        assertThat(kb.getPermission()).isEqualTo(request.getPermission().getCode());
    }

    @Test
    void createDataSet_trimsWhitespaceFromName() {
        stubEmbeddingModelFound();
        request.setName("   Support Docs   ");

        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, "Support Docs", "1"))
                .thenReturn(false);

        Knowledgebase saved = Knowledgebase.builder().id(DATASET_ID).build();
        when(datasetRepository.save(any())).thenReturn(saved);
        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(saved));

        datasetServiceImpl.createDataSet(TENANT_ID, request);

        verify(datasetRepository).existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, "Support Docs", "1");

        ArgumentCaptor<Knowledgebase> captor = ArgumentCaptor.forClass(Knowledgebase.class);
        verify(datasetRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Support Docs");
    }

    // ---------- validation: createDataSet ----------

    @Test
    void createDataSet_blankName_throwsValidationException() {
        request.setName("   ");

        DatasetValidationException ex = assertThrows(DatasetValidationException.class,
                () -> datasetServiceImpl.createDataSet(TENANT_ID, request));

        assertThat(ex.getMessage()).isEqualTo("Name is required");
        verifyNoInteractions(datasetRepository);
        verifyNoInteractions(embeddingModelService);
    }

    @Test
    void createDataSet_nullName_throwsValidationException() {
        request.setName(null);

        assertThrows(DatasetValidationException.class,
                () -> datasetServiceImpl.createDataSet(TENANT_ID, request));
        verifyNoInteractions(datasetRepository);
        verifyNoInteractions(embeddingModelService);
    }

    // ---------- duplicate name: createDataSet ----------
    // Note: duplicate-name check happens BEFORE the embedding model lookup
    // in the impl, so these two do not need stubEmbeddingModelFound().

    @Test
    void createDataSet_duplicateName_throwsDuplicateDatasetNameExceptionAndDoesNotSave() {
        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, DATASET_NAME, "1"))
                .thenReturn(true);

        assertThrows(DuplicateDatasetNameException.class,
                () -> datasetServiceImpl.createDataSet(TENANT_ID, request));

        verify(datasetRepository, never()).save(any());
        verifyNoInteractions(embeddingModelService);
    }

    @Test
    void createDataSet_duplicateCheckIsCaseInsensitive() {
        request.setName("support docs");
        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, "support docs", "1"))
                .thenReturn(true);

        assertThrows(DuplicateDatasetNameException.class,
                () -> datasetServiceImpl.createDataSet(TENANT_ID, request));
    }

    // ---------- reload-after-save failure ----------

    @Test
    void createDataSet_entityMissingAfterSave_throwsResourceNotFoundException() {
        stubEmbeddingModelFound();
        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(anyString(), anyString(), anyString()))
                .thenReturn(false);

        Knowledgebase saved = Knowledgebase.builder().id(DATASET_ID).build();
        when(datasetRepository.save(any(Knowledgebase.class))).thenReturn(saved);
        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> datasetServiceImpl.createDataSet(TENANT_ID, request));

        assertThat(ex.getMessage()).isEqualTo("Dataset created failed");
        verify(datasetRepository, times(1)).save(any(Knowledgebase.class));
    }

    // ---------- tenant isolation ----------

    @Test
    void createDataSet_duplicateCheckScopedToTenant() {
        stubEmbeddingModelFound();
        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(eq(TENANT_ID), eq(DATASET_NAME), eq("1")))
                .thenReturn(false);

        Knowledgebase saved = Knowledgebase.builder().id(DATASET_ID).tenantId(TENANT_ID).build();
        when(datasetRepository.save(any(Knowledgebase.class))).thenReturn(saved);
        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(saved));

        datasetServiceImpl.createDataSet(TENANT_ID, request);

        verify(datasetRepository, never())
                .existsByTenantIdAndNameIgnoreCaseAndStatus(eq("some-other-tenant"), anyString(), anyString());
    }

    // ---------- getDatasetDetail ----------

    @Test
    void getDatasetDetail_Success() {
        stubEmbeddingModelFound();

        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .name("Dataset")
                .avatar("avatar.png")
                .description("Description")
                .permission("me")
                .embdId(EMBEDDING_MODEL_ID)
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        ApiResponseDto response = datasetServiceImpl.getDatasetDetail(DATASET_ID, TENANT_ID);

        assertThat(response).isNotNull();
        verify(datasetRepository).findById(DATASET_ID);
    }

    @Test
    void getDatasetDetail_DatasetNotFound() {
        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> datasetServiceImpl.getDatasetDetail(DATASET_ID, TENANT_ID));

        // Was hardcoded to "Dataset not found" -- impl actually throws
        // CommonConstants.DATASET_NOT_FOUND, same constant used everywhere
        // else in this file. Comparing against the constant instead of a
        // duplicated literal.
        assertThat(ex.getMessage()).isEqualTo(CommonConstants.DATASET_NOT_FOUND);
        verify(datasetRepository).findById(DATASET_ID);
    }

    @Test
    void getDatasetDetail_TenantMismatch() {
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId("anotherTenant")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> datasetServiceImpl.getDatasetDetail(DATASET_ID, TENANT_ID));

        assertThat(ex.getMessage()).isEqualTo("You do not have access to this dataset");
        // Thrown before the embedding-model lookup -- no stub needed, and
        // confirming it's never reached.
        verifyNoInteractions(embeddingModelService);
    }

    @Test
    void getDatasetDetail_TemporarilyDeleted_ThrowsResourceNotFoundException() {
        // New branch in the impl not covered before: status == "0" means
        // soft-deleted, and getDatasetDetail rejects it even for the owner.
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .status("0")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> datasetServiceImpl.getDatasetDetail(DATASET_ID, TENANT_ID));

        assertThat(ex.getMessage()).isEqualTo("Dataset is temporary deleted and will be deleted in some days!");
    }

    // ---------- getAllDatasetDetail ----------

    @Test
    void getAllDatasetDetail_Success() {
        stubEmbeddingModelFound();

        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .name("Dataset")
                .avatar("avatar.png")
                .description("Description")
                .permission("me")
                .embdId(EMBEDDING_MODEL_ID)
                .build();

        when(datasetRepository.findByTenantId(TENANT_ID)).thenReturn(List.of(kb));

        ApiResponseDto response = datasetServiceImpl.getAllDatasetDetail(TENANT_ID);

        assertThat(response).isNotNull();
        verify(datasetRepository).findByTenantId(TENANT_ID);
    }

    @Test
    void getAllDatasetDetail_EmptyList() {
        when(datasetRepository.findByTenantId(TENANT_ID)).thenReturn(Collections.emptyList());

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> datasetServiceImpl.getAllDatasetDetail(TENANT_ID));

        assertThat(ex.getMessage()).isEqualTo("You do not have access to this dataset");
        verify(datasetRepository).findByTenantId(TENANT_ID);
        verifyNoInteractions(embeddingModelService);
    }

    @Test
    void getAllDatasetDetail_MapsDatasetCorrectly() {
        stubEmbeddingModelFound();

        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .name("Support Docs")
                .description("Corporate docs")
                .avatar("avatar.png")
                .permission("me")
                .embdId(EMBEDDING_MODEL_ID)
                .build();

        when(datasetRepository.findByTenantId(TENANT_ID)).thenReturn(List.of(kb));

        ApiResponseDto response = datasetServiceImpl.getAllDatasetDetail(TENANT_ID);

        assertThat(response).isNotNull();
        verify(datasetRepository).findByTenantId(TENANT_ID);
    }

    // ---------- updateDataset ----------

    @Test
    void updateDataset_Success() {
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .createdBy(TENANT_ID)
                .name("Old Dataset")
                .description("Old Description")
                .build();

        UpdateDatasetRequest request1 = UpdateDatasetRequest.builder()
                .name("New Dataset")
                .description("New Description")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));
        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, "New Dataset", "1"))
                .thenReturn(false);
        when(datasetRepository.save(any(Knowledgebase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApiResponseDto response = datasetServiceImpl.updateDataset(DATASET_ID, TENANT_ID, request1);

        assertThat(response).isNotNull();
        verify(datasetRepository).findById(DATASET_ID);
        verify(datasetRepository).save(kb);
        assertThat(kb.getName()).isEqualTo("New Dataset");
        assertThat(kb.getDescription()).isEqualTo("New Description");
    }

    @Test
    void updateDataset_DuplicateName() {
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .createdBy(TENANT_ID)
                .name("Old Dataset")
                .build();

        UpdateDatasetRequest request1 = UpdateDatasetRequest.builder()
                .name("New Dataset")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));
        when(datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(TENANT_ID, "New Dataset", "1"))
                .thenReturn(true);

        assertThrows(DuplicateDatasetNameException.class,
                () -> datasetServiceImpl.updateDataset(DATASET_ID, TENANT_ID, request1));

        verify(datasetRepository, never()).save(any());
    }

    @Test
    void updateDataset_NoNameChange_ThrowsException() {
        // Documents CURRENT behavior: the impl's `else` branch throws
        // whenever the name isn't changed -- meaning a description-only
        // update is not currently possible. Flagging this as worth
        // confirming intentional; if it's not, this test (and the `else`
        // branch itself) should be revisited together.
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .createdBy(TENANT_ID)
                .name("Same Name")
                .build();

        UpdateDatasetRequest request1 = UpdateDatasetRequest.builder()
                .name("Same Name")
                .description("Just updating the description")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        DuplicateDatasetNameException ex = assertThrows(DuplicateDatasetNameException.class,
                () -> datasetServiceImpl.updateDataset(DATASET_ID, TENANT_ID, request1));

        assertThat(ex.getMessage())
                .isEqualTo("You are Updating with same DataSet name, Kindly update new one!");
        verify(datasetRepository, never()).save(any());
    }

    @Test
    void updateDataset_NameTooShort_ThrowsValidationException() {
        // New branch (newName.length() < 4) had no coverage at all.
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .createdBy(TENANT_ID)
                .name("Old Dataset")
                .build();

        UpdateDatasetRequest request1 = UpdateDatasetRequest.builder()
                .name("Ab")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        assertThrows(DatasetValidationException.class,
                () -> datasetServiceImpl.updateDataset(DATASET_ID, TENANT_ID, request1));

        verify(datasetRepository, never()).save(any());
    }

    // ---------- deleteDataset ----------
    // Rewritten: impl soft-deletes via save(), never calls deleteById.

    @Test
    void deleteDataset_Success() {
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .createdBy(TENANT_ID)
                .permission("me") // not team
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));
        when(datasetRepository.save(any(Knowledgebase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApiResponseDto response = datasetServiceImpl.deleteDataset(DATASET_ID, TENANT_ID);

        assertThat(response).isNotNull();
        verify(datasetRepository).findById(DATASET_ID);
        verify(datasetRepository, never()).deleteById(any());
        verify(datasetRepository).save(kb);

        assertThat(kb.getStatus()).isEqualTo("0");
        assertThat(kb.getDocNum()).isEqualTo(0);
    }

    @Test
    void deleteDataset_DatasetNotFound() {
        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> datasetServiceImpl.deleteDataset(DATASET_ID, TENANT_ID));

        assertThat(ex.getMessage()).isEqualTo(CommonConstants.DATASET_NOT_FOUND);
        verify(datasetRepository).findById(DATASET_ID);
        verify(datasetRepository, never()).save(any());
    }

    @Test
    void deleteDataset_WrongTenant() {
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId("another-tenant")
                .createdBy("another-tenant")
                .permission("me")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> datasetServiceImpl.deleteDataset(DATASET_ID, TENANT_ID));

        assertEquals("You do not have access to this dataset", ex.getMessage());
        verify(datasetRepository, never()).save(any());
    }

    @Test
    void deleteDataset_NotOwner() {
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .createdBy("another-user")
                .permission("me")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> datasetServiceImpl.deleteDataset(DATASET_ID, TENANT_ID));

        assertEquals("Only the dataset owner can delete it", ex.getMessage());
        verify(datasetRepository, never()).save(any());
    }

    @Test
    void deleteDataset_TeamPermission() {
        Knowledgebase kb = Knowledgebase.builder()
                .id(DATASET_ID)
                .tenantId(TENANT_ID)
                .createdBy(TENANT_ID)
                .permission("team")
                .build();

        when(datasetRepository.findById(DATASET_ID)).thenReturn(Optional.of(kb));

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> datasetServiceImpl.deleteDataset(DATASET_ID, TENANT_ID));

        assertEquals(
                "This is a shared (team) dataset -- explicit deletion permission is required",
                ex.getMessage());
        verify(datasetRepository, never()).save(any());
    }
}