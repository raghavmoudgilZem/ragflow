package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.request.Chunk;
import com.ragflow.retrieval.dto.request.IndexJobMessage;
import com.ragflow.retrieval.enums.IndexRegistryStatus;
import com.ragflow.retrieval.enums.JobStatus;
import com.ragflow.retrieval.repository.IndexJobRepository;
import com.ragflow.retrieval.repository.IndexRegistryRepository;
import com.ragflow.retrieval.util.DocumentChunker;
import com.ragflow.retrieval.util.ElasticsearchChunkWriter;
import com.ragflow.retrieval.util.EmbeddingClient;
import com.ragflow.retrieval.util.StorageClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class IndexJobWorkerService {

    private static final DateTimeFormatter CREATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final StorageClient storageClient;
    private final DocumentChunker chunker;
    private final EmbeddingClient embeddingClient;
    private final ElasticsearchChunkWriter chunkWriter;
    private final IndexJobRepository indexJobRepository;
    private final IndexRegistryRepository indexRegistryRepository;

    public IndexJobWorkerService(StorageClient storageClient,
                                 DocumentChunker chunker,
                                 EmbeddingClient embeddingClient,
                                 ElasticsearchChunkWriter chunkWriter,
                                 IndexJobRepository indexJobRepository, IndexRegistryRepository indexRegistryRepository) {
        this.storageClient = storageClient;
        this.chunker = chunker;
        this.embeddingClient = embeddingClient;
        this.chunkWriter = chunkWriter;
        this.indexJobRepository = indexJobRepository;
        this.indexRegistryRepository = indexRegistryRepository;
    }

    @RabbitListener(
            queues = "${rag.queue.index-jobs-name}",
            concurrency = "${rag.queue.index-jobs-concurrency}")
    public void onMessage(IndexJobMessage message) {
        Long jobId = message.jobId();
        log.info("Picked up index job {} (docId={})", jobId, message.docId());

        // Job may have been cancelled between publish and delivery.
        if (isCancelled(jobId)) {
            log.info("Job {} was cancelled before processing started; skipping", jobId);
            return;
        }

        log.info("marking index job {}  as running", jobId);
        try {
            this.indexJobRepository.markRunning(jobId, JobStatus.RUNNING, Instant.now());
            log.info("started fetch parsed content for job id :{}", jobId);
            // --- Stage 1: fetch parsed content -----------------------------
            String text = this.storageClient.fetchText(
                    message.storageType(), message.bucket(), message.objectKey());

            log.info("again checking is job cancelled job id :{}", jobId);
            if (isCancelled(jobId)) {
                log.info("Job {} cancelled after fetch stage", jobId);
                return;
            }

            log.info("started chunking for job id :{}", jobId);
            // --- Stage 2: chunk ---------------------------------------------
            List<Chunk> chunks = this.chunker.chunk(message.parserId(), text, message.parserConfig());
            if (chunks.isEmpty()) {
                // A document that now parses to nothing still supersedes what it
                // had before, so its old chunks go too — otherwise emptying a
                // document would leave its previous content searchable.
                long removed = this.chunkWriter.deleteByDocId(message.tenantId(), message.docId());
                markSucceeded(jobId, message.kbId(), message.docId(), 0, 0);
                log.warn("Job {} produced zero chunks from parsed content; cleared {} previously indexed chunks",
                        jobId, removed);
                return;
            }

            log.info("again checking is job cancelled job id :{}", jobId);
            if (isCancelled(jobId)) {
                log.info("Job {} cancelled after chunking stage", jobId);
                return;
            }

            // --- Stage 3: embed ----------------------------------------------
            String embeddingModelId = message.embeddingModelId();

            List<String> texts = chunks.stream().map(Chunk::content).toList();
            log.info("embedding for chunk list job id :{}", jobId);
            //Right now calling Gemini embedding later we need to llm service for embedding.
            List<float[]> vectors = this.embeddingClient.geminiEmbed(embeddingModelId, texts);
            int vectorDim = vectors.get(0).length;
            String vectorField = "q_" + vectorDim + "_vec";

            if (isCancelled(jobId)) {
                log.info("Job {} cancelled after embedding stage", jobId);
                return;
            }

            // --- Stage 4: index into Elasticsearch ----------------------------
            this.chunkWriter.ensureIndex(message.tenantId(), vectorDim);

            // Chunk ids are derived from chunk text, so an edited document's
            // chunks land under new ids and the previous version's chunks would
            // otherwise stay searchable forever. Clearing them first makes this
            // job's writes the document's complete set of chunks.
            //
            // Deliberately delete-then-write: a job that fails midway leaves the
            // document partially indexed until it is resubmitted, which is
            // recoverable, whereas leaking superseded chunks is permanent and
            // silently wrong. Chunks whose text did not change are deleted and
            // rewritten under the same id, so they are briefly missing from
            // search — the same window the batched writes below already have.
            long removed = this.chunkWriter.deleteByDocId(message.tenantId(), message.docId());
            log.info("Job {} cleared {} previously indexed chunks for docId={}",
                    jobId, removed, message.docId());

            // Index-time stamp, shared by every chunk of this job. Mirrors
            // RagFlow's create_time (string) / create_timestamp_flt (epoch seconds).
            Instant indexedAt = Instant.now();
            String createTime = LocalDateTime.ofInstant(indexedAt, ZoneId.systemDefault())
                    .format(CREATE_TIME_FORMAT);
            double createTimestampFlt = indexedAt.toEpochMilli() / 1000.0;

            int totalTokens = 0;
            int indexed = 0;
            // Write in batches so progress can be reported incrementally on
            // large documents rather than only at the very end.
            int batchSize = 200;
            for (int start = 0; start < chunks.size(); start += batchSize) {
                if (isCancelled(jobId)) {
                    log.info("Job {} cancelled mid-indexing ({} of {} chunks written)",
                            jobId, indexed, chunks.size());
                    return;
                }

                int end = Math.min(start + batchSize, chunks.size());
                List<ElasticsearchChunkWriter.ChunkDocument> batch = chunks.subList(start, end).stream()
                        .map(c -> new ElasticsearchChunkWriter.ChunkDocument(
                                chunkId(c.content(), message.docId()),
                                message.tenantId(),
                                message.kbId(),
                                message.docId(),
                                message.docName(),
                                c.content(),
                                vectorField,
                                vectors.get(c.index()),
                                createTime,
                                createTimestampFlt))
                        .toList();

                chunkWriter.bulkIndex(message.tenantId(), batch);

                indexed = end;
                totalTokens += chunks.subList(start, end).stream().mapToInt(Chunk::tokenCount).sum();
                float progress = (float) indexed / chunks.size();
                indexJobRepository.updateProgress(jobId, progress, indexed, totalTokens);
            }

            // --- Stage 5: mark done -------------------------------------------
            markSucceeded(jobId, message.kbId(), message.docId(), indexed, totalTokens);
            log.info("Job {} completed: {} chunks, {} tokens", jobId, indexed, totalTokens);

        } catch (Exception e) {
            log.error("Job {} failed: {}", jobId, e.getMessage(), e);
            indexJobRepository.markFailed(jobId, JobStatus.FAILED, Instant.now(), truncate(e.getMessage()));
            // Not rethrown: this is a terminal, job-specific failure already
            // recorded in index_jobs, not a transient error that should
            // trigger a broker-level redelivery/DLQ retry.
        }
    }

    private boolean isCancelled(Long jobId) {
        return indexJobRepository.findStatus(jobId)
                .map(status -> status == JobStatus.CANCELLED)
                .orElse(false);
    }

    private void markSucceeded(Long jobId, String kbId, String docId, int chunkCount, int tokenCount) {
        indexJobRepository.updateProgress(jobId, 1.0f, chunkCount, tokenCount);
        indexJobRepository.markSucceeded(jobId, JobStatus.SUCCEEDED, Instant.now(), 1.0f);

        rollUpIntoRegistry(jobId, kbId, docId, chunkCount);
    }


    private void rollUpIntoRegistry(Long jobId, String kbId, String docId, int chunkCount) {
        try {
            // docCount should reflect distinct docs indexed under this KB, not
            // "successful jobs" — re-indexing an already-indexed doc (e.g. after
            // an edit) must not double-count it. A prior SUCCEEDED job for the
            // same docId means this is a re-index, not a new doc.
            boolean isNewDoc = !indexJobRepository.existsSucceededForDocExcluding(docId, jobId);
            int docDelta = isNewDoc ? 1 : 0;

            // NOTE: chunkCount is still added as-is on every success, including
            // re-indexes — same open approximation flagged previously. A clean
            // fix needs either deleting the doc's prior ES chunks before
            // re-indexing, or tracking per-doc chunk counts to diff against.
            indexRegistryRepository.adjustCounts(kbId, docDelta, chunkCount, Instant.now());

            // First successful job for this KB flips BUILDING -> ACTIVE, which
            // is also what arms IndexJobService's embedding-model pin for
            // subsequent submissions.
            indexRegistryRepository.activateIfBuilding(
                    kbId, Instant.now(), IndexRegistryStatus.BUILDING, IndexRegistryStatus.ACTIVE);

        } catch (Exception e) {
            log.error("Job {} succeeded but rolling it up into index_registry for kbId={} failed; "
                            + "the job stays SUCCEEDED and the registry row may be stale: {}",
                    jobId, kbId, e.getMessage(), e);
        }
    }

    private String truncate(String message) {
        if (message == null) return "Unknown error";
        return message.length() > 2000 ? message.substring(0, 2000) : message;
    }

    /**
     * Deterministic, content-addressed chunk id: the same chunk text + docId
     * always yields the same id, so re-indexing a document upserts its chunks
     * in place instead of creating duplicates. Mirrors RagFlow's content id
     * (RagFlow uses xxhash64; this uses a truncated SHA-256 to avoid adding a
     * dependency — the value differs from RagFlow's, but the idempotency it
     * gives is identical).
     */
    private static String chunkId(String content, String docId) {
        return DigestUtils.sha256Hex(content + docId).substring(0, 16);
    }
}
