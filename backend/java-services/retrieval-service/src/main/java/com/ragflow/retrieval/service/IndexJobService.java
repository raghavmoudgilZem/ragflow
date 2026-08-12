package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.request.IndexJobMessage;
import com.ragflow.retrieval.dto.request.ParsedContentRef;
import com.ragflow.retrieval.dto.request.SubmitIndexJobRequest;
import com.ragflow.retrieval.dto.response.EmbeddingModelResponse;
import com.ragflow.retrieval.entity.IndexJob;
import com.ragflow.retrieval.entity.IndexRegistry;
import com.ragflow.retrieval.enums.IndexRegistryStatus;
import com.ragflow.retrieval.enums.JobStatus;
import com.ragflow.retrieval.exception.EmbeddingModelMismatchException;
import com.ragflow.retrieval.exception.EmbeddingServiceException;
import com.ragflow.retrieval.exception.JobAlreadyRunningException;
import com.ragflow.retrieval.exception.ParsedContentUnreadableException;
import com.ragflow.retrieval.exception.UnknownEmbeddingModelException;
import com.ragflow.retrieval.repository.IndexJobRepository;
import com.ragflow.retrieval.repository.IndexRegistryRepository;
import com.ragflow.retrieval.util.EmbeddingClient;
import com.ragflow.retrieval.util.IndexJobPublisher;
import com.ragflow.retrieval.util.StorageClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class IndexJobService {

    private final IndexJobRepository indexJobRepository;
    private final EmbeddingClient embeddingClient;
    private final StorageClient storageClient;
    private final IndexJobPublisher indexJobPublisher;
    private final IndexRegistryRepository indexRegistryRepository;
    @Value("${rag.elasticsearch.index-prefix}")
    private String indexPrefix;

    public IndexJobService(IndexJobRepository indexJobRepository,
                           EmbeddingClient embeddingClient,
                           StorageClient storageClient,
                           IndexJobPublisher indexJobPublisher, IndexRegistryRepository indexRegistryRepository) {
        this.indexJobRepository = indexJobRepository;
        this.embeddingClient = embeddingClient;
        this.storageClient = storageClient;
        this.indexJobPublisher = indexJobPublisher;
        this.indexRegistryRepository = indexRegistryRepository;
    }


    public IndexJob submitIndexJob(String kbId, SubmitIndexJobRequest request) {

        log.info("request for job :{}",request);
        log.info("checking existing job for doc id :{}",request.docId());
        // --- 409: a job for this docId is already RUNNING -----------------
        Optional<IndexJob> existing = this.indexJobRepository.findActiveJobForDoc(request.docId());
        if (existing.isPresent() && existing.get().getStatus() == JobStatus.RUNNING) {
            throw new JobAlreadyRunningException(request.docId(), existing.get().getJobId());
        }

        log.info("checking model exist for model id :{}",request.embeddingModelId());
        // --- 400: embeddingModelId unknown (missing already caught by @Valid) ---
        EmbeddingModelResponse embeddingModelResponse=this.embeddingClient.exists(request.embeddingModelId());
        if (Boolean.FALSE.equals(embeddingModelResponse.existStatus())) {
            throw new UnknownEmbeddingModelException(request.embeddingModelId());
        }

        log.info("checking parse content :{} is reachable or not",request.parsedContentRef());
        // --- 422: parsedContentRef unreadable ------------------------------
        ParsedContentRef ref = request.parsedContentRef();
        if (!this.storageClient.canRead(ref)) {
            throw new ParsedContentUnreadableException(
                    ref.storageType(), ref.bucket(), ref.objectKey());
        }

        Instant submittedAt = Instant.now();
        Optional<IndexRegistry> registry = indexRegistryRepository.findByKbId(kbId);

        if (registry.isPresent()) {
            IndexRegistry reg = registry.get();
            if ((reg.getStatus() == IndexRegistryStatus.ACTIVE || reg.getStatus() == IndexRegistryStatus.BUILDING) && !reg.getEmbeddingModelId().equals(request.embeddingModelId())) {
                throw new EmbeddingModelMismatchException(kbId, reg.getEmbeddingModelId(), request.embeddingModelId());
            }
        } else {
            // The dimension decides the dense_vector mapping the whole KB is
            // built around, so a response without it cannot be registered.
            // Caught here rather than at the entity boundary, where a null
            // Integer meeting a primitive column is only an opaque NPE.
            if (embeddingModelResponse.dimension() == null) {
                throw new EmbeddingServiceException(
                        "Embedding service reported no vector dimension for embeddingModelId '"
                                + request.embeddingModelId() + "'; cannot register an index for kbId=" + kbId);
            }

            indexRegistryRepository.save(IndexRegistry.builder()
                    .kbId(kbId)
                    .tenantId(request.tenantId())
                    .esIndexName(indexPrefix + request.tenantId())
                    .vectorDim(embeddingModelResponse.dimension())
                    .embeddingModelId(request.embeddingModelId())
                    .status(IndexRegistryStatus.BUILDING)
                    .docCount(0)
                    .chunkCount(0)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build());
        }


        IndexJob job = IndexJob.builder()
                .kbId(kbId)
                .docId(request.docId())
                .tenantId(request.tenantId())
                .docName(request.docName())
                .storageType(ref.storageType())
                .storageBucket(ref.bucket())
                .storageObjectKey(ref.objectKey())
                .parserId(request.parserId())
                .parserConfig(request.parserConfig())
                .embeddingModelId(request.embeddingModelId())
                .priority(request.priority())
                .status(JobStatus.QUEUED)
                .progress(0f)
                .chunkCount(0)
                .tokenCount(0)
                .errorMessage(null)
                .submittedAt(submittedAt)
                .startedAt(null)
                .finishedAt(null)
                .build();

        // Persist first so GET /index-jobs/{jobId} (A2) is consistent even if
        // enqueue is briefly delayed.

        IndexJob saved = this.indexJobRepository.save(job);
        log.info("index job saved :{}",saved);
        // Hand off to the async pipeline (chunking -> embedding -> indexing).
        this.indexJobPublisher.publish(IndexJobMessage.from(saved));

        return saved;
    }
}
