package com.ragflow.retrieval.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.ragflow.retrieval.dto.request.IndexJobMessage;
import com.ragflow.retrieval.dto.request.ParsedContentRef;
import com.ragflow.retrieval.dto.request.SubmitIndexJobRequest;
import com.ragflow.retrieval.dto.response.EmbeddingModelResponse;
import com.ragflow.retrieval.entity.IndexJob;
import com.ragflow.retrieval.entity.IndexRegistry;
import com.ragflow.retrieval.enums.IndexRegistryStatus;
import com.ragflow.retrieval.enums.JobPriority;
import com.ragflow.retrieval.enums.JobStatus;
import com.ragflow.retrieval.exception.EmbeddingModelMismatchException;
import com.ragflow.retrieval.exception.EmbeddingServiceException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.exception.JobAlreadyRunningException;
import com.ragflow.retrieval.exception.ParsedContentUnreadableException;
import com.ragflow.retrieval.exception.UnknownEmbeddingModelException;
import com.ragflow.retrieval.repository.IndexJobRepository;
import com.ragflow.retrieval.repository.IndexRegistryRepository;
import com.ragflow.retrieval.util.EmbeddingClient;
import com.ragflow.retrieval.util.IndexJobPublisher;
import com.ragflow.retrieval.util.StorageClient;

/**
 * Submission is the only synchronous part of indexing, and its job is to reject
 * work it cannot run before anything is persisted or enqueued. Each rejection
 * below maps to a distinct HTTP status the API promises (409 / 400 / 422), so
 * the tests assert the exception type rather than a message.
 *
 * <p>Submission also owns the KB's index registry: the first job for a KB
 * registers it as BUILDING and pins the embedding model, and every later job is
 * checked against that pin while the KB is BUILDING or ACTIVE. Those tests are
 * the ones that keep an index from holding vectors of two different models.
 *
 * <p>The other guarantee under test is ordering: the registry row and the job
 * row must both exist before the message is published, otherwise a fast
 * consumer could look up state that is not there yet.
 */
@ExtendWith(MockitoExtension.class)
class IndexJobServiceTest {

    private static final String KB_ID = "kb-1";
    private static final String DOC_ID = "doc-1";
    private static final String TENANT_ID = "tenant-1";
    private static final String MODEL_ID = "gemini-embedding-001";
    private static final String OTHER_MODEL_ID = "text-embedding-3-small";
    private static final String INDEX_PREFIX = "ragflow_";
    private static final int VECTOR_DIM = 768;

    @Mock
    private IndexJobRepository indexJobRepository;

    @Mock
    private EmbeddingClient embeddingClient;

    @Mock
    private StorageClient storageClient;

    @Mock
    private IndexJobPublisher indexJobPublisher;

    @Mock
    private IndexRegistryRepository indexRegistryRepository;

    private IndexJobService service;

    @BeforeEach
    void setUp() {
        service = new IndexJobService(indexJobRepository, embeddingClient, storageClient,
                indexJobPublisher, indexRegistryRepository);
        // Field-injected @Value, so it is null unless set here; it is what the
        // registry's es_index_name is built from.
        ReflectionTestUtils.setField(service, "indexPrefix", INDEX_PREFIX);
    }

    // ---------------------------------------------------------------- helpers

    private static ParsedContentRef ref() {
        return new ParsedContentRef("MINIO", "parsed", "tenant-1/doc-1.txt");
    }

    /** Builder so a test can vary one field without mutating a shared request. */
    private static SubmitIndexJobRequest.SubmitIndexJobRequestBuilder requestBuilder() {
        return SubmitIndexJobRequest.builder()
                .docId(DOC_ID)
                .tenantId(TENANT_ID)
                .docName("handbook.pdf")
                .parsedContentRef(ref())
                .parserId("naive")
                .parserConfig(Map.of("chunkTokenSize", 256))
                .embeddingModelId(MODEL_ID)
                .priority(JobPriority.HIGH);
    }

    private static SubmitIndexJobRequest request() {
        return requestBuilder().build();
    }

    private static IndexRegistry registry(IndexRegistryStatus status, String embeddingModelId) {
        return IndexRegistry.builder()
                .kbId(KB_ID)
                .tenantId(TENANT_ID)
                .esIndexName(INDEX_PREFIX + TENANT_ID)
                .vectorDim(VECTOR_DIM)
                .embeddingModelId(embeddingModelId)
                .status(status)
                .build();
    }

    /**
     * Stubs the pre-flight checks so submission reaches the persist step, with
     * the KB not yet registered (so the first-submit path registers it).
     */
    private void allChecksPass() {
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.empty());
        when(embeddingClient.exists(MODEL_ID)).thenReturn(new EmbeddingModelResponse(true, VECTOR_DIM));
        when(storageClient.canRead(any())).thenReturn(true);
        when(indexRegistryRepository.findByKbId(KB_ID)).thenReturn(Optional.empty());
    }

    /** As {@link #allChecksPass()}, but the KB already has a registry row. */
    private void allChecksPassWithRegistry(IndexRegistryStatus status, String registeredModelId) {
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.empty());
        when(embeddingClient.exists(anyString())).thenReturn(new EmbeddingModelResponse(true, VECTOR_DIM));
        when(storageClient.canRead(any())).thenReturn(true);
        when(indexRegistryRepository.findByKbId(KB_ID))
                .thenReturn(Optional.of(registry(status, registeredModelId)));
    }

    /** save() returns the managed entity; mimic the DB assigning the id. */
    private void saveAssignsId(long jobId) {
        when(indexJobRepository.save(any(IndexJob.class))).thenAnswer(invocation -> {
            IndexJob job = invocation.getArgument(0);
            job.setJobId(jobId);
            return job;
        });
    }

    // ------------------------------------------------------------- happy path

    @Test
    void submit_persistsQueuedJobWithZeroedCounters() {
        allChecksPass();
        saveAssignsId(42L);

        IndexJob saved = service.submitIndexJob(KB_ID, request());

        ArgumentCaptor<IndexJob> captor = ArgumentCaptor.forClass(IndexJob.class);
        verify(indexJobRepository).save(captor.capture());
        IndexJob persisted = captor.getValue();

        assertThat(persisted.getKbId()).isEqualTo(KB_ID);
        assertThat(persisted.getDocId()).isEqualTo(DOC_ID);
        assertThat(persisted.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(persisted.getDocName()).isEqualTo("handbook.pdf");
        assertThat(persisted.getEmbeddingModelId()).isEqualTo(MODEL_ID);
        assertThat(persisted.getPriority()).isEqualTo(JobPriority.HIGH);

        // A freshly submitted job is QUEUED with nothing done yet: a worker
        // reading any other starting state would report bogus progress.
        assertThat(persisted.getStatus()).isEqualTo(JobStatus.QUEUED);
        assertThat(persisted.getProgress()).isZero();
        assertThat(persisted.getChunkCount()).isZero();
        assertThat(persisted.getTokenCount()).isZero();
        assertThat(persisted.getErrorMessage()).isNull();
        assertThat(persisted.getSubmittedAt()).isNotNull();
        assertThat(persisted.getStartedAt()).isNull();
        assertThat(persisted.getFinishedAt()).isNull();

        assertThat(saved.getJobId()).isEqualTo(42L);
    }

    @Test
    void submit_flattensParsedContentRefOntoTheJobRow() {
        allChecksPass();
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, request());

        ArgumentCaptor<IndexJob> captor = ArgumentCaptor.forClass(IndexJob.class);
        verify(indexJobRepository).save(captor.capture());

        assertThat(captor.getValue().getStorageType()).isEqualTo("MINIO");
        assertThat(captor.getValue().getStorageBucket()).isEqualTo("parsed");
        assertThat(captor.getValue().getStorageObjectKey()).isEqualTo("tenant-1/doc-1.txt");
    }

    @Test
    void submit_publishesMessageBuiltFromTheSavedRow() {
        allChecksPass();
        saveAssignsId(7L);

        service.submitIndexJob(KB_ID, request());

        ArgumentCaptor<IndexJobMessage> captor = ArgumentCaptor.forClass(IndexJobMessage.class);
        verify(indexJobPublisher).publish(captor.capture());
        IndexJobMessage message = captor.getValue();

        // The message must carry the assigned id — a message built before save
        // would carry null and the worker could never find the row.
        assertThat(message.jobId()).isEqualTo(7L);
        assertThat(message.kbId()).isEqualTo(KB_ID);
        assertThat(message.docId()).isEqualTo(DOC_ID);
        assertThat(message.tenantId()).isEqualTo(TENANT_ID);
        assertThat(message.bucket()).isEqualTo("parsed");
        assertThat(message.objectKey()).isEqualTo("tenant-1/doc-1.txt");
        assertThat(message.priority()).isEqualTo("HIGH");
    }

    @Test
    void submit_savesBeforePublishing() {
        allChecksPass();
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, request());

        // Ordering is the point: a consumer that picks the message up
        // immediately has to find the job row already there.
        InOrder inOrder = Mockito.inOrder(indexJobRepository, indexJobPublisher);
        inOrder.verify(indexJobRepository).save(any(IndexJob.class));
        inOrder.verify(indexJobPublisher).publish(any(IndexJobMessage.class));
    }

    @Test
    void submit_defaultsNullParserConfigToEmptyMap() {
        allChecksPass();
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, requestBuilder().parserConfig(null).build());

        ArgumentCaptor<IndexJob> captor = ArgumentCaptor.forClass(IndexJob.class);
        verify(indexJobRepository).save(captor.capture());

        // parser_config is a NOT NULL json column; null here fails the insert.
        assertThat(captor.getValue().getParserConfig()).isNotNull().isEmpty();
    }

    @Test
    void submit_keepsProvidedParserConfig() {
        allChecksPass();
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, request());

        ArgumentCaptor<IndexJob> captor = ArgumentCaptor.forClass(IndexJob.class);
        verify(indexJobRepository).save(captor.capture());

        assertThat(captor.getValue().getParserConfig()).containsEntry("chunkTokenSize", 256);
    }

    // --------------------------------------------------------- 409: duplicate

    @Test
    void submit_rejectsWhenAJobForTheSameDocIsRunning() {
        IndexJob running = IndexJob.builder()
                .jobId(99L)
                .docId(DOC_ID)
                .status(JobStatus.RUNNING)
                .build();
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.of(running));

        assertThatThrownBy(() -> service.submitIndexJob(KB_ID, request()))
                .isInstanceOf(JobAlreadyRunningException.class)
                .hasMessageContaining("99")
                .hasMessageContaining(DOC_ID)
                .extracting(e -> ((JobAlreadyRunningException) e).getErrorCode())
                .isEqualTo(ErrorCode.JOB_ALREADY_RUNNING);

        // Rejected before anything is checked, written or enqueued.
        verify(indexJobRepository, never()).save(any());
        verifyNoInteractions(indexJobPublisher, embeddingClient, storageClient, indexRegistryRepository);
    }

    @Test
    void submit_allowsResubmitWhenTheExistingJobIsOnlyQueued() {
        // findActiveJobForDoc matches QUEUED and RUNNING, but only RUNNING is a
        // conflict — a queued duplicate is deliberately allowed through.
        IndexJob queued = IndexJob.builder()
                .jobId(98L)
                .docId(DOC_ID)
                .status(JobStatus.QUEUED)
                .build();
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.of(queued));
        when(embeddingClient.exists(MODEL_ID)).thenReturn(new EmbeddingModelResponse(true, VECTOR_DIM));
        when(storageClient.canRead(any())).thenReturn(true);
        when(indexRegistryRepository.findByKbId(KB_ID)).thenReturn(Optional.empty());
        saveAssignsId(100L);

        IndexJob saved = service.submitIndexJob(KB_ID, request());

        assertThat(saved.getJobId()).isEqualTo(100L);
        verify(indexJobPublisher).publish(any(IndexJobMessage.class));
    }

    // ----------------------------------------------------- 400: unknown model

    @Test
    void submit_rejectsUnknownEmbeddingModel() {
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.empty());
        when(embeddingClient.exists(MODEL_ID)).thenReturn(new EmbeddingModelResponse(false, null));

        assertThatThrownBy(() -> service.submitIndexJob(KB_ID, request()))
                .isInstanceOf(UnknownEmbeddingModelException.class)
                .hasMessageContaining(MODEL_ID)
                .extracting(e -> ((UnknownEmbeddingModelException) e).getErrorCode())
                .isEqualTo(ErrorCode.UNKNOWN_EMBEDDING_MODEL);

        verify(indexJobRepository, never()).save(any());
        verifyNoInteractions(indexJobPublisher, storageClient, indexRegistryRepository);
    }

    // ------------------------------------------------ 422: unreadable content

    @Test
    void submit_rejectsUnreadableParsedContent() {
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.empty());
        when(embeddingClient.exists(MODEL_ID)).thenReturn(new EmbeddingModelResponse(true, VECTOR_DIM));
        when(storageClient.canRead(any())).thenReturn(false);

        assertThatThrownBy(() -> service.submitIndexJob(KB_ID, request()))
                .isInstanceOf(ParsedContentUnreadableException.class)
                .hasMessageContaining("MINIO")
                .hasMessageContaining("parsed")
                .hasMessageContaining("tenant-1/doc-1.txt")
                .extracting(e -> ((ParsedContentUnreadableException) e).getErrorCode())
                .isEqualTo(ErrorCode.PARSED_CONTENT_UNREADABLE);

        verify(indexJobRepository, never()).save(any());
        verifyNoInteractions(indexJobPublisher, indexRegistryRepository);
    }

    @Test
    void submit_checksTheRefItWasGiven() {
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.empty());
        when(embeddingClient.exists(MODEL_ID)).thenReturn(new EmbeddingModelResponse(true, VECTOR_DIM));
        when(storageClient.canRead(any())).thenReturn(false);

        assertThatThrownBy(() -> service.submitIndexJob(KB_ID, request()))
                .isInstanceOf(ParsedContentUnreadableException.class);

        ArgumentCaptor<ParsedContentRef> captor = ArgumentCaptor.forClass(ParsedContentRef.class);
        verify(storageClient).canRead(captor.capture());
        assertThat(captor.getValue()).isEqualTo(ref());
    }

    // --------------------------------------------------------- index registry

    @Test
    void submit_registersTheKbAsBuildingOnItsFirstJob() {
        allChecksPass();
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, request());

        ArgumentCaptor<IndexRegistry> captor = ArgumentCaptor.forClass(IndexRegistry.class);
        verify(indexRegistryRepository).save(captor.capture());
        IndexRegistry registered = captor.getValue();

        assertThat(registered.getKbId()).isEqualTo(KB_ID);
        assertThat(registered.getTenantId()).isEqualTo(TENANT_ID);
        // The Elasticsearch index is per tenant, not per KB, so the name is
        // prefix + tenantId.
        assertThat(registered.getEsIndexName()).isEqualTo("ragflow_tenant-1");
        // Dimension comes from the embedding service's own answer, not a guess:
        // it decides the dense_vector mapping later.
        assertThat(registered.getVectorDim()).isEqualTo(VECTOR_DIM);
        assertThat(registered.getEmbeddingModelId()).isEqualTo(MODEL_ID);
        // BUILDING, not ACTIVE: nothing has been indexed yet.
        assertThat(registered.getStatus()).isEqualTo(IndexRegistryStatus.BUILDING);
        assertThat(registered.getDocCount()).isZero();
        assertThat(registered.getChunkCount()).isZero();
        assertThat(registered.getCreatedAt()).isNotNull();
        assertThat(registered.getUpdatedAt()).isNotNull();
    }

    @Test
    void submit_leavesAnExistingRegistryAlone() {
        allChecksPassWithRegistry(IndexRegistryStatus.ACTIVE, MODEL_ID);
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, request());

        // Re-registering would reset the KB's counters and status on every
        // submission.
        verify(indexRegistryRepository, never()).save(any(IndexRegistry.class));
        verify(indexJobPublisher).publish(any(IndexJobMessage.class));
    }

    @Test
    void submit_rejectsADifferentEmbeddingModelOnAnActiveKb() {
        allChecksPassWithRegistry(IndexRegistryStatus.ACTIVE, MODEL_ID);

        SubmitIndexJobRequest request = requestBuilder().embeddingModelId(OTHER_MODEL_ID).build();

        // Mixing models in one index makes vector search meaningless: the
        // dimensions differ and the spaces are not comparable.
        assertThatThrownBy(() -> service.submitIndexJob(KB_ID, request))
                .isInstanceOf(EmbeddingModelMismatchException.class)
                .hasMessageContaining(KB_ID)
                .hasMessageContaining(MODEL_ID)
                .hasMessageContaining(OTHER_MODEL_ID)
                .extracting(e -> ((EmbeddingModelMismatchException) e).getErrorCode())
                .isEqualTo(ErrorCode.UNKNOWN_EMBEDDING_MODEL);

        // Rejected before the job row exists, so no half-submitted job.
        verify(indexJobRepository, never()).save(any());
        verify(indexRegistryRepository, never()).save(any(IndexRegistry.class));
        verifyNoInteractions(indexJobPublisher);
    }

    @Test
    void submit_acceptsTheSameEmbeddingModelOnAnActiveKb() {
        allChecksPassWithRegistry(IndexRegistryStatus.ACTIVE, MODEL_ID);
        saveAssignsId(5L);

        assertThat(service.submitIndexJob(KB_ID, request()).getJobId()).isEqualTo(5L);
    }

    @Test
    void submit_rejectsADifferentEmbeddingModelWhileTheKbIsStillBuilding() {
        allChecksPassWithRegistry(IndexRegistryStatus.BUILDING, MODEL_ID);

        SubmitIndexJobRequest request = requestBuilder().embeddingModelId(OTHER_MODEL_ID).build();

        // The window before the first job succeeds is exactly when a second job
        // could otherwise slip a different model into the same index, so the pin
        // covers BUILDING as well as ACTIVE.
        assertThatThrownBy(() -> service.submitIndexJob(KB_ID, request))
                .isInstanceOf(EmbeddingModelMismatchException.class);

        verify(indexJobRepository, never()).save(any());
        verifyNoInteractions(indexJobPublisher);
    }

    @Test
    void submit_acceptsTheSameEmbeddingModelWhileTheKbIsStillBuilding() {
        allChecksPassWithRegistry(IndexRegistryStatus.BUILDING, MODEL_ID);
        saveAssignsId(5L);

        // Pinning BUILDING must not block the ordinary case: further documents
        // submitted to a KB whose first job has not finished yet.
        assertThat(service.submitIndexJob(KB_ID, request()).getJobId()).isEqualTo(5L);
        verify(indexRegistryRepository, never()).save(any(IndexRegistry.class));
    }

    @Test
    void submit_allowsADifferentModelWhileTheKbIsBeingDeleted() {
        allChecksPassWithRegistry(IndexRegistryStatus.DELETING, MODEL_ID);
        saveAssignsId(5L);

        SubmitIndexJobRequest request = requestBuilder().embeddingModelId(OTHER_MODEL_ID).build();

        // DELETING/DELETED sit outside the pin: that index is going away, so
        // there is nothing left to keep consistent. Pinned so a future decision
        // to reject here too is a deliberate one.
        assertThat(service.submitIndexJob(KB_ID, request).getJobId()).isEqualTo(5L);
    }

    @Test
    void submit_rejectsAModelResponseWithoutADimension() {
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.empty());
        // status true, but no "dim" in the payload.
        when(embeddingClient.exists(MODEL_ID)).thenReturn(new EmbeddingModelResponse(true, null));
        when(storageClient.canRead(any())).thenReturn(true);
        when(indexRegistryRepository.findByKbId(KB_ID)).thenReturn(Optional.empty());

        // The dimension defines the KB's dense_vector mapping, so registering
        // without it is refused with a message naming the model and the KB —
        // this used to be an opaque NPE from a null Integer meeting a primitive
        // column. Only the first job for a KB can hit it.
        assertThatThrownBy(() -> service.submitIndexJob(KB_ID, request()))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasMessageContaining(MODEL_ID)
                .hasMessageContaining(KB_ID)
                .extracting(e -> ((EmbeddingServiceException) e).getErrorCode())
                .isEqualTo(ErrorCode.EMBEDDING_SERVICE);

        // Nothing registered, nothing queued.
        verify(indexRegistryRepository, never()).save(any(IndexRegistry.class));
        verify(indexJobRepository, never()).save(any());
        verifyNoInteractions(indexJobPublisher);
    }

    @Test
    void submit_registersTheKbBeforeQueueingTheJob() {
        allChecksPass();
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, request());

        // The worker's completion path updates the registry row, so it has to
        // exist by the time the message can be consumed.
        InOrder inOrder = Mockito.inOrder(indexRegistryRepository, indexJobRepository, indexJobPublisher);
        inOrder.verify(indexRegistryRepository).save(any(IndexRegistry.class));
        inOrder.verify(indexJobRepository).save(any(IndexJob.class));
        inOrder.verify(indexJobPublisher).publish(any(IndexJobMessage.class));
    }

    @Test
    void submit_looksUpTheRegistryByKbId() {
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenReturn(Optional.empty());
        when(embeddingClient.exists(MODEL_ID)).thenReturn(new EmbeddingModelResponse(true, VECTOR_DIM));
        when(storageClient.canRead(any())).thenReturn(true);
        when(indexRegistryRepository.findByKbId("other-kb")).thenReturn(Optional.empty());
        saveAssignsId(1L);

        service.submitIndexJob("other-kb", request());

        // Keyed by the path's kbId, not by the request's tenantId.
        verify(indexRegistryRepository).findByKbId("other-kb");
    }

    // ------------------------------------------------------- lookup contracts

    @Test
    void submit_looksUpActiveJobsForTheRequestedDocOnly() {
        allChecksPass();
        saveAssignsId(1L);

        service.submitIndexJob(KB_ID, request());

        verify(indexJobRepository).findActiveJobForDoc(DOC_ID);
    }

    @Test
    void findActiveJobForDoc_returnsEmptyWhenNoActiveJobExists() {
        // The default method on the repository interface, exercised for real
        // over a stubbed derived query.
        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenCallRealMethod();
        when(indexJobRepository.findByDocIdAndStatusInOrderBySubmittedAtDesc(anyString(), any()))
                .thenReturn(List.of());

        assertThat(indexJobRepository.findActiveJobForDoc(DOC_ID)).isEmpty();

        // Only unfinished jobs count as active — a SUCCEEDED or FAILED job for
        // the same doc must never block a resubmission.
        verify(indexJobRepository).findByDocIdAndStatusInOrderBySubmittedAtDesc(
                DOC_ID, List.of(JobStatus.QUEUED, JobStatus.RUNNING));
    }

    @Test
    void findActiveJobForDoc_returnsMostRecentlySubmittedJob() {
        IndexJob newest = IndexJob.builder().jobId(2L).status(JobStatus.RUNNING).build();
        IndexJob older = IndexJob.builder().jobId(1L).status(JobStatus.QUEUED).build();

        when(indexJobRepository.findActiveJobForDoc(DOC_ID)).thenCallRealMethod();
        when(indexJobRepository.findByDocIdAndStatusInOrderBySubmittedAtDesc(anyString(), any()))
                .thenReturn(List.of(newest, older));

        // The query orders by submittedAt desc, so "first" means "most recent".
        Optional<IndexJob> active = indexJobRepository.findActiveJobForDoc(DOC_ID);

        assertThat(active).containsSame(newest);
    }
}
