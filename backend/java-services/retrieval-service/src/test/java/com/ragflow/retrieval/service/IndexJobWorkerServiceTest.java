package com.ragflow.retrieval.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyFloat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.ragflow.retrieval.dto.request.Chunk;
import com.ragflow.retrieval.dto.request.IndexJobMessage;
import com.ragflow.retrieval.enums.IndexRegistryStatus;
import com.ragflow.retrieval.enums.JobStatus;
import com.ragflow.retrieval.repository.IndexJobRepository;
import com.ragflow.retrieval.repository.IndexRegistryRepository;
import com.ragflow.retrieval.util.DocumentChunker;
import com.ragflow.retrieval.util.ElasticsearchChunkWriter;
import com.ragflow.retrieval.util.ElasticsearchChunkWriter.ChunkDocument;
import com.ragflow.retrieval.util.EmbeddingClient;
import com.ragflow.retrieval.util.StorageClient;

/**
 * The worker is the five-stage indexing pipeline, and its important properties
 * are not visible from any single stage:
 *
 * <ul>
 *   <li><b>Cancellation is checked between every stage.</b> Each test cancels at
 *       one specific point and asserts the stages after it never run — that is
 *       the only thing making an in-flight job abortable.
 *   <li><b>A job failure is terminal, not a broker retry.</b> The failure tests
 *       assert nothing is rethrown; rethrowing would nack the message and put
 *       the same doomed job back on the queue forever.
 *   <li><b>A document's previous chunks are cleared before it is rewritten.</b>
 *       Chunk ids come from chunk text, so without this an edited document's old
 *       chunks stay searchable permanently.
 *   <li><b>Success also rolls up into the KB's registry</b> — counters plus the
 *       BUILDING to ACTIVE flip — but only as a best effort, never at the cost of
 *       the job's own verdict.
 * </ul>
 *
 * <p>Cancellation is driven by consecutive {@code findStatus} stubs: the worker
 * polls it once per stage boundary, so the n-th return value decides which
 * boundary trips.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class IndexJobWorkerServiceTest {

    private static final long JOB_ID = 77L;
    private static final String TENANT_ID = "tenant-1";
    private static final String KB_ID = "kb-1";
    private static final String DOC_ID = "doc-1";
    private static final String DOC_NAME = "handbook.pdf";
    private static final String MODEL_ID = "gemini-embedding-001";
    private static final String PARSED_TEXT = "line one\nline two";

    @Mock
    private StorageClient storageClient;

    @Mock
    private DocumentChunker chunker;

    @Mock
    private EmbeddingClient embeddingClient;

    @Mock
    private ElasticsearchChunkWriter chunkWriter;

    @Mock
    private IndexJobRepository indexJobRepository;

    @Mock
    private IndexRegistryRepository indexRegistryRepository;

    private IndexJobWorkerService worker;

    @BeforeEach
    void setUp() {
        worker = new IndexJobWorkerService(storageClient, chunker, embeddingClient, chunkWriter,
                indexJobRepository, indexRegistryRepository);
    }

    // ---------------------------------------------------------------- helpers

    private static IndexJobMessage message() {
        return IndexJobMessage.builder()
                .jobId(JOB_ID)
                .kbId(KB_ID)
                .docId(DOC_ID)
                .tenantId(TENANT_ID)
                .docName(DOC_NAME)
                .storageType("MINIO")
                .bucket("parsed")
                .objectKey("tenant-1/doc-1.txt")
                .parserId("naive")
                .parserConfig(Map.of("chunkTokenSize", 256))
                .embeddingModelId(MODEL_ID)
                .priority("NORMAL")
                .build();
    }

    private static List<Chunk> chunks(int count) {
        List<Chunk> chunks = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            chunks.add(new Chunk(i, "chunk content " + i, 10));
        }
        return chunks;
    }

    private static List<float[]> vectors(int count, int dim) {
        List<float[]> vectors = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            float[] vector = new float[dim];
            vector[0] = i;
            vectors.add(vector);
        }
        return vectors;
    }

    /** Never cancelled: every stage boundary sees a live job. */
    private void jobStaysRunning() {
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(Optional.of(JobStatus.RUNNING));
    }

    /** Wires a full successful run over {@code chunkCount} chunks of {@code dim} dimensions. */
    private void pipelineProduces(int chunkCount, int dim) throws IOException {
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn(PARSED_TEXT);
        when(chunker.chunk(anyString(), anyString(), any())).thenReturn(chunks(chunkCount));
        when(embeddingClient.geminiEmbed(anyString(), anyList())).thenReturn(vectors(chunkCount, dim));
    }

    @SuppressWarnings("unchecked")
    private List<List<ChunkDocument>> capturedBatches() throws IOException {
        ArgumentCaptor<List<ChunkDocument>> captor = ArgumentCaptor.forClass(List.class);
        verify(chunkWriter, Mockito.atLeastOnce()).bulkIndex(eq(TENANT_ID), captor.capture());
        return captor.getAllValues();
    }

    private void verifyTerminalStateUntouched() {
        verify(indexJobRepository, never()).markSucceeded(anyLong(), any(), any(), anyFloat());
        verify(indexJobRepository, never()).markFailed(anyLong(), any(), any(), anyString());
        // A cancelled job contributes nothing: no counters, no BUILDING -> ACTIVE.
        verifyNoInteractions(indexRegistryRepository);
    }

    // ------------------------------------------------------------- happy path

    @Test
    void onMessage_runsEveryStageInOrderAndMarksSucceeded() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 768);

        worker.onMessage(message());

        InOrder inOrder = Mockito.inOrder(indexJobRepository, storageClient, chunker, embeddingClient, chunkWriter);
        inOrder.verify(indexJobRepository).markRunning(eq(JOB_ID), eq(JobStatus.RUNNING), any());
        inOrder.verify(storageClient).fetchText("MINIO", "parsed", "tenant-1/doc-1.txt");
        inOrder.verify(chunker).chunk("naive", PARSED_TEXT, Map.of("chunkTokenSize", 256));
        inOrder.verify(embeddingClient).geminiEmbed(eq(MODEL_ID), anyList());
        inOrder.verify(chunkWriter).ensureIndex(TENANT_ID, 768);
        inOrder.verify(chunkWriter).deleteByDocId(TENANT_ID, DOC_ID);
        inOrder.verify(chunkWriter).bulkIndex(eq(TENANT_ID), anyList());
        inOrder.verify(indexJobRepository).markSucceeded(eq(JOB_ID), eq(JobStatus.SUCCEEDED), any(), eq(1.0f));

        verify(indexJobRepository, never()).markFailed(anyLong(), any(), any(), anyString());
    }

    @Test
    void onMessage_embedsChunkContentInOrder() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 4);

        worker.onMessage(message());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<String>> captor = ArgumentCaptor.forClass(List.class);
        verify(embeddingClient).geminiEmbed(eq(MODEL_ID), captor.capture());

        // Position is the only link between a text and its vector downstream.
        assertThat(captor.getValue())
                .containsExactly("chunk content 0", "chunk content 1", "chunk content 2");
    }

    @Test
    void onMessage_derivesVectorFieldNameFromEmbeddingDimension() throws IOException {
        jobStaysRunning();
        pipelineProduces(1, 1024);

        worker.onMessage(message());

        // The dim-derived field name is what lets two embedding models coexist
        // in one tenant index; a wrong name silently writes an unsearchable doc.
        verify(chunkWriter).ensureIndex(TENANT_ID, 1024);
        assertThat(capturedBatches().get(0).get(0).vectorFieldName()).isEqualTo("q_1024_vec");
    }

    @Test
    void onMessage_writesEveryChunkFieldTheIndexNeeds() throws IOException {
        jobStaysRunning();
        pipelineProduces(1, 8);

        worker.onMessage(message());

        ChunkDocument document = capturedBatches().get(0).get(0);
        assertThat(document.tenantId()).isEqualTo(TENANT_ID);
        assertThat(document.kbId()).isEqualTo(KB_ID);
        assertThat(document.docId()).isEqualTo(DOC_ID);
        assertThat(document.docName()).isEqualTo(DOC_NAME);
        assertThat(document.content()).isEqualTo("chunk content 0");
        assertThat(document.vector()).hasSize(8);
        assertThat(document.createTime()).matches("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}");
        assertThat(document.createTimestampFlt()).isGreaterThan(0d);
    }

    @Test
    void onMessage_pairsEachChunkWithItsOwnVector() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 4);

        worker.onMessage(message());

        List<ChunkDocument> batch = capturedBatches().get(0);
        // vectors[i][0] was seeded with i, so a mis-pairing shows up here.
        assertThat(batch.get(0).vector()[0]).isEqualTo(0f);
        assertThat(batch.get(1).vector()[0]).isEqualTo(1f);
        assertThat(batch.get(2).vector()[0]).isEqualTo(2f);
    }

    @Test
    void onMessage_stampsEveryChunkOfAJobWithTheSameCreateTime() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 4);

        worker.onMessage(message());

        List<ChunkDocument> batch = capturedBatches().get(0);
        assertThat(batch).extracting(ChunkDocument::createTime).containsOnly(batch.get(0).createTime());
        assertThat(batch).extracting(ChunkDocument::createTimestampFlt)
                .containsOnly(batch.get(0).createTimestampFlt());
    }

    // ------------------------------------------------------- chunk id / upsert

    @Test
    void onMessage_derivesStableContentAddressedChunkIds() throws IOException {
        jobStaysRunning();
        pipelineProduces(2, 4);

        worker.onMessage(message());
        List<ChunkDocument> first = capturedBatches().get(0);

        Mockito.clearInvocations(chunkWriter);
        worker.onMessage(message());
        List<ChunkDocument> second = capturedBatches().get(0);

        // Re-indexing identical content must land on the same ids, so the write
        // is an upsert rather than a second copy.
        assertThat(second).extracting(ChunkDocument::chunkId)
                .containsExactly(first.get(0).chunkId(), first.get(1).chunkId());

        // Distinct content still gets distinct ids.
        assertThat(first.get(0).chunkId()).isNotEqualTo(first.get(1).chunkId());
        assertThat(first.get(0).chunkId()).hasSize(16);
    }

    @Test
    void onMessage_scopesChunkIdsByDocument() throws IOException {
        jobStaysRunning();
        pipelineProduces(1, 4);

        worker.onMessage(message());
        String idForDoc1 = capturedBatches().get(0).get(0).chunkId();

        Mockito.clearInvocations(chunkWriter);
        IndexJobMessage otherDoc = IndexJobMessage.builder()
                .jobId(JOB_ID).kbId(KB_ID).docId("doc-2").tenantId(TENANT_ID).docName(DOC_NAME)
                .storageType("MINIO").bucket("parsed").objectKey("k").parserId("naive")
                .parserConfig(Map.of()).embeddingModelId(MODEL_ID).priority("NORMAL")
                .build();
        worker.onMessage(otherDoc);

        // Identical chunk text in a different document is a different chunk;
        // sharing an id would make one document's re-index clobber the other's.
        assertThat(capturedBatches().get(0).get(0).chunkId()).isNotEqualTo(idForDoc1);
    }

    // ------------------------------------------------------ stale chunk purge

    @Test
    void onMessage_clearsThePreviousChunksBeforeWritingTheNewOnes() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 4);
        when(chunkWriter.deleteByDocId(TENANT_ID, DOC_ID)).thenReturn(7L);

        worker.onMessage(message());

        // Chunk ids come from chunk text, so an edited document's chunks arrive
        // under new ids; without this delete the old ones stay searchable
        // forever. Ordering is the whole point — deleting after the writes would
        // remove the chunks this job just created.
        InOrder inOrder = Mockito.inOrder(chunkWriter);
        inOrder.verify(chunkWriter).ensureIndex(TENANT_ID, 4);
        inOrder.verify(chunkWriter).deleteByDocId(TENANT_ID, DOC_ID);
        inOrder.verify(chunkWriter).bulkIndex(eq(TENANT_ID), anyList());
    }

    @Test
    void onMessage_purgesOnceForTheWholeDocumentNotPerBatch() throws IOException {
        jobStaysRunning();
        pipelineProduces(450, 4);

        worker.onMessage(message());

        // Three batches, one delete: a delete inside the batch loop would erase
        // each batch as the next one was written.
        assertThat(capturedBatches()).hasSize(3);
        verify(chunkWriter, times(1)).deleteByDocId(TENANT_ID, DOC_ID);
    }

    @Test
    void onMessage_marksFailedWhenClearingPriorChunksFails() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 4);
        when(chunkWriter.deleteByDocId(anyString(), anyString()))
                .thenThrow(new IOException("delete_by_query failed"));

        assertThatCode(() -> worker.onMessage(message())).doesNotThrowAnyException();

        // Writing new chunks on top of chunks that could not be cleared is what
        // this stage exists to prevent, so the job fails instead.
        verify(chunkWriter, never()).bulkIndex(anyString(), anyList());
        verify(indexJobRepository).markFailed(eq(JOB_ID), eq(JobStatus.FAILED), any(),
                eq("delete_by_query failed"));
    }

    @Test
    void onMessage_doesNotTouchIndexedChunksWhenCancelledBeforeIndexing() throws IOException {
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.CANCELLED));
        pipelineProduces(3, 4);

        worker.onMessage(message());

        // A cancelled job must leave the document exactly as it was: deleting
        // its chunks and then stopping would silently unindex it.
        verify(chunkWriter, never()).deleteByDocId(anyString(), anyString());
    }

    // --------------------------------------------------------------- batching

    @Test
    void onMessage_writesInBatchesOf200AndReportsProgressPerBatch() throws IOException {
        jobStaysRunning();
        pipelineProduces(450, 4);

        worker.onMessage(message());

        List<List<ChunkDocument>> batches = capturedBatches();
        assertThat(batches).hasSize(3);
        assertThat(batches.get(0)).hasSize(200);
        assertThat(batches.get(1)).hasSize(200);
        assertThat(batches.get(2)).hasSize(50);

        // Progress is written after every batch, so a long document reports
        // incremental progress rather than jumping 0 -> 1 at the very end.
        ArgumentCaptor<Float> progress = ArgumentCaptor.forClass(Float.class);
        ArgumentCaptor<Integer> chunkCount = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> tokenCount = ArgumentCaptor.forClass(Integer.class);
        verify(indexJobRepository, times(4))
                .updateProgress(eq(JOB_ID), progress.capture(), chunkCount.capture(), tokenCount.capture());

        assertThat(chunkCount.getAllValues()).containsExactly(200, 400, 450, 450);
        assertThat(progress.getAllValues().subList(0, 3))
                .containsExactly(200f / 450, 400f / 450, 1.0f);
        // 10 tokens per stub chunk, accumulated across batches.
        assertThat(tokenCount.getAllValues()).containsExactly(2000, 4000, 4500, 4500);
    }

    @Test
    void onMessage_writesASingleBatchWhenChunksFitExactly() throws IOException {
        jobStaysRunning();
        pipelineProduces(200, 4);

        worker.onMessage(message());

        // 200 is the batch size itself: an off-by-one in the loop bound would
        // add an empty second batch here.
        assertThat(capturedBatches()).hasSize(1);
        verify(indexJobRepository, times(2)).updateProgress(eq(JOB_ID), anyFloat(), anyInt(), anyInt());
    }

    @Test
    void onMessage_finalisesWithFullProgressBeforeMarkingSucceeded() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 4);

        worker.onMessage(message());

        InOrder inOrder = Mockito.inOrder(indexJobRepository);
        // Written twice — once closing the last batch, once by markSucceeded —
        // but both must land before the status flips.
        inOrder.verify(indexJobRepository, times(2)).updateProgress(JOB_ID, 1.0f, 3, 30);
        inOrder.verify(indexJobRepository).markSucceeded(eq(JOB_ID), eq(JobStatus.SUCCEEDED), any(), eq(1.0f));
    }

    // ------------------------------------------------------------ empty input

    @Test
    void onMessage_succeedsWithZeroCountsWhenChunkingYieldsNothing() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn("");
        when(chunker.chunk(anyString(), anyString(), any())).thenReturn(List.of());

        worker.onMessage(message());

        // An empty document is a successful no-op, not a failure.
        verify(indexJobRepository).updateProgress(JOB_ID, 1.0f, 0, 0);
        verify(indexJobRepository).markSucceeded(eq(JOB_ID), eq(JobStatus.SUCCEEDED), any(), eq(1.0f));
        verify(indexJobRepository, never()).markFailed(anyLong(), any(), any(), anyString());

        // Nothing downstream should have been paid for: no embedding, and no
        // index creation or writes (the stale-chunk delete is the only
        // Elasticsearch call on this path).
        verifyNoInteractions(embeddingClient);
        verify(chunkWriter, never()).ensureIndex(anyString(), anyInt());
        verify(chunkWriter, never()).bulkIndex(anyString(), anyList());
    }

    @Test
    void onMessage_clearsPriorChunksWhenTheDocumentNowParsesToNothing() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn("");
        when(chunker.chunk(anyString(), anyString(), any())).thenReturn(List.of());

        worker.onMessage(message());

        // Emptying a document must not leave its previous content searchable,
        // even though this path writes nothing. deleteByDocId tolerates a
        // missing index, which is what makes this safe on a brand-new tenant.
        verify(chunkWriter).deleteByDocId(TENANT_ID, DOC_ID);
    }

    // ----------------------------------------------------------- cancellation

    @Test
    void onMessage_skipsJobCancelledBeforeDelivery() {
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(Optional.of(JobStatus.CANCELLED));

        worker.onMessage(message());

        // Not even marked RUNNING: the job never started.
        verify(indexJobRepository, never()).markRunning(anyLong(), any(), any());
        verifyNoInteractions(storageClient, chunker, embeddingClient, chunkWriter);
    }

    @Test
    void onMessage_stopsAfterFetchWhenCancelled() throws IOException {
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(
                Optional.of(JobStatus.RUNNING),    // before start
                Optional.of(JobStatus.CANCELLED)); // after fetch
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn(PARSED_TEXT);

        worker.onMessage(message());

        verify(storageClient).fetchText(anyString(), anyString(), anyString());
        verifyNoInteractions(chunker, embeddingClient, chunkWriter);
        verifyTerminalStateUntouched();
    }

    @Test
    void onMessage_stopsAfterChunkingWhenCancelled() throws IOException {
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.CANCELLED)); // after chunking
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn(PARSED_TEXT);
        when(chunker.chunk(anyString(), anyString(), any())).thenReturn(chunks(3));

        worker.onMessage(message());

        verify(chunker).chunk(anyString(), anyString(), any());
        // Embedding is the expensive external call — cancelling before it is
        // the whole reason for a check at this boundary.
        verifyNoInteractions(embeddingClient, chunkWriter);
        verifyTerminalStateUntouched();
    }

    @Test
    void onMessage_stopsAfterEmbeddingWhenCancelled() throws IOException {
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.CANCELLED)); // after embedding
        pipelineProduces(3, 4);

        worker.onMessage(message());

        verify(embeddingClient).geminiEmbed(anyString(), anyList());
        // Nothing reaches Elasticsearch, so the document is left untouched.
        verifyNoInteractions(chunkWriter);
        verifyTerminalStateUntouched();
    }

    @Test
    void onMessage_stopsMidIndexingWhenCancelled() throws IOException {
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),
                Optional.of(JobStatus.RUNNING),     // first batch
                Optional.of(JobStatus.CANCELLED));  // second batch
        pipelineProduces(450, 4);

        worker.onMessage(message());

        // Batches already written stay written and their progress stands; the
        // job simply stops, without being marked succeeded or failed.
        assertThat(capturedBatches()).hasSize(1);
        verify(indexJobRepository).updateProgress(JOB_ID, 200f / 450, 200, 2000);
        verifyTerminalStateUntouched();
    }

    @Test
    void onMessage_treatsAMissingJobRowAsNotCancelled() throws IOException {
        // findStatus returns empty for an unknown id; orElse(false) means the
        // pipeline proceeds rather than silently dropping the message.
        when(indexJobRepository.findStatus(JOB_ID)).thenReturn(Optional.empty());
        pipelineProduces(1, 4);

        worker.onMessage(message());

        verify(indexJobRepository).markSucceeded(eq(JOB_ID), eq(JobStatus.SUCCEEDED), any(), eq(1.0f));
    }

    // -------------------------------------------------------- index registry

    @Test
    void onMessage_updatesTheRegistryAfterTheJobRow() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 768);

        worker.onMessage(message());

        // Counters then activation, both after the job itself is SUCCEEDED: the
        // registry is a rollup of finished work, never of in-flight work.
        InOrder inOrder = Mockito.inOrder(indexJobRepository, indexRegistryRepository);
        inOrder.verify(indexJobRepository).markSucceeded(eq(JOB_ID), eq(JobStatus.SUCCEEDED), any(), eq(1.0f));
        inOrder.verify(indexRegistryRepository).adjustCounts(eq(KB_ID), eq(1), eq(3), any());
        inOrder.verify(indexRegistryRepository).activateIfBuilding(
                eq(KB_ID), any(), eq(IndexRegistryStatus.BUILDING), eq(IndexRegistryStatus.ACTIVE));
    }

    @Test
    void onMessage_countsAFirstTimeIndexAsANewDoc() throws IOException {
        jobStaysRunning();
        pipelineProduces(5, 4);
        // No other SUCCEEDED job for this doc.
        when(indexJobRepository.existsSucceededForDocExcluding(DOC_ID, JOB_ID)).thenReturn(false);

        worker.onMessage(message());

        verify(indexRegistryRepository).adjustCounts(eq(KB_ID), eq(1), eq(5), any());
    }

    @Test
    void onMessage_doesNotRecountADocThatWasIndexedBefore() throws IOException {
        jobStaysRunning();
        pipelineProduces(5, 4);
        // A previous job for the same doc already succeeded: this is a re-index.
        when(indexJobRepository.existsSucceededForDocExcluding(DOC_ID, JOB_ID)).thenReturn(true);

        worker.onMessage(message());

        // doc_count must not grow when a document is merely re-indexed after an
        // edit. chunk_count still grows by the full batch — the known
        // approximation called out in the source, pinned here so a later fix
        // has to change this expectation on purpose.
        verify(indexRegistryRepository).adjustCounts(eq(KB_ID), eq(0), eq(5), any());
    }

    @Test
    void onMessage_excludesTheCurrentJobWhenLookingForPriorSuccesses() throws IOException {
        jobStaysRunning();
        pipelineProduces(1, 4);

        worker.onMessage(message());

        // The current job is SUCCEEDED by this point, so counting it would make
        // every first index look like a re-index and doc_count would never move.
        verify(indexJobRepository).existsSucceededForDocExcluding(DOC_ID, JOB_ID);
    }

    @Test
    void onMessage_flipsTheKbFromBuildingToActiveOnSuccess() throws IOException {
        jobStaysRunning();
        pipelineProduces(2, 4);

        worker.onMessage(message());

        // This transition is what arms the embedding-model pin on submission;
        // the query's WHERE clause makes it a no-op for an already-ACTIVE KB.
        verify(indexRegistryRepository).activateIfBuilding(
                eq(KB_ID), any(), eq(IndexRegistryStatus.BUILDING), eq(IndexRegistryStatus.ACTIVE));
    }

    @Test
    void onMessage_registersAnEmptyDocumentAndActivatesTheKb() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn("");
        when(chunker.chunk(anyString(), anyString(), any())).thenReturn(List.of());

        worker.onMessage(message());

        // A document that chunked to nothing still counts as a processed doc
        // with zero chunks, and still activates the KB — the early return goes
        // through the same success path.
        verify(indexRegistryRepository).adjustCounts(eq(KB_ID), eq(1), eq(0), any());
        verify(indexRegistryRepository).activateIfBuilding(
                eq(KB_ID), any(), eq(IndexRegistryStatus.BUILDING), eq(IndexRegistryStatus.ACTIVE));
    }

    @Test
    void onMessage_keepsTheJobSucceededWhenTheRegistryRollUpFails() throws IOException {
        jobStaysRunning();
        pipelineProduces(2, 4);
        when(indexRegistryRepository.adjustCounts(anyString(), anyInt(), anyInt(), any()))
                .thenThrow(new RuntimeException("registry row missing"));

        assertThatCode(() -> worker.onMessage(message())).doesNotThrowAnyException();

        // The chunks are in Elasticsearch and the job row already said
        // SUCCEEDED, so a failing rollup must not rewrite that into FAILED and
        // report a failure for work that actually landed. Stale counters are
        // recoverable from index_jobs; a wrong job verdict is not.
        verify(indexJobRepository).markSucceeded(eq(JOB_ID), eq(JobStatus.SUCCEEDED), any(), eq(1.0f));
        verify(indexJobRepository, never()).markFailed(anyLong(), any(), any(), anyString());
    }

    @Test
    void onMessage_stopsTheRollUpAtTheFailingStep() throws IOException {
        jobStaysRunning();
        pipelineProduces(2, 4);
        when(indexRegistryRepository.adjustCounts(anyString(), anyInt(), anyInt(), any()))
                .thenThrow(new RuntimeException("registry row missing"));

        worker.onMessage(message());

        // Swallowing the failure does not mean carrying on with the rest of the
        // rollup: the KB stays un-activated, which is the visible symptom to
        // recover from.
        verify(indexRegistryRepository, never()).activateIfBuilding(anyString(), any(), any(), any());
    }

    // --------------------------------------------------------------- failures

    @Test
    void onMessage_marksFailedWithoutRethrowingWhenFetchFails() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString()))
                .thenThrow(new IOException("parsed/tenant-1/doc-1.txt not found"));

        // Rethrowing would nack the message and redeliver a job that can never
        // succeed; the failure belongs on the job row instead.
        assertThatCode(() -> worker.onMessage(message())).doesNotThrowAnyException();

        verify(indexJobRepository).markFailed(eq(JOB_ID), eq(JobStatus.FAILED), any(),
                eq("parsed/tenant-1/doc-1.txt not found"));
        verify(indexJobRepository, never()).markSucceeded(anyLong(), any(), any(), anyFloat());
        // A failed job must not inflate the KB's counters or activate it.
        verifyNoInteractions(indexRegistryRepository);
    }

    @Test
    void onMessage_marksFailedWhenEmbeddingFails() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn(PARSED_TEXT);
        when(chunker.chunk(anyString(), anyString(), any())).thenReturn(chunks(2));
        when(embeddingClient.geminiEmbed(anyString(), anyList()))
                .thenThrow(new RuntimeException("embedding provider unavailable"));

        assertThatCode(() -> worker.onMessage(message())).doesNotThrowAnyException();

        verify(indexJobRepository).markFailed(eq(JOB_ID), eq(JobStatus.FAILED), any(),
                eq("embedding provider unavailable"));
        verifyNoInteractions(chunkWriter, indexRegistryRepository);
    }

    @Test
    void onMessage_marksFailedWhenBulkIndexingFails() throws IOException {
        jobStaysRunning();
        pipelineProduces(3, 4);
        Mockito.doThrow(new IOException("Bulk index had failures: c1: mapper_parsing_exception; "))
                .when(chunkWriter).bulkIndex(anyString(), anyList());

        assertThatCode(() -> worker.onMessage(message())).doesNotThrowAnyException();

        verify(indexJobRepository).markFailed(eq(JOB_ID), eq(JobStatus.FAILED), any(),
                eq("Bulk index had failures: c1: mapper_parsing_exception; "));
        verify(indexJobRepository, never()).markSucceeded(anyLong(), any(), any(), anyFloat());
        verifyNoInteractions(indexRegistryRepository);
    }

    @Test
    void onMessage_marksFailedWhenTheEmbeddingResponseIsEmpty() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString())).thenReturn(PARSED_TEXT);
        when(chunker.chunk(anyString(), anyString(), any())).thenReturn(chunks(2));
        // Chunks exist but no vectors came back: reading vectors.get(0) to
        // derive the dimension blows up, and that must land as a job failure.
        when(embeddingClient.geminiEmbed(anyString(), anyList())).thenReturn(List.of());

        assertThatCode(() -> worker.onMessage(message())).doesNotThrowAnyException();

        verify(indexJobRepository).markFailed(eq(JOB_ID), eq(JobStatus.FAILED), any(), anyString());
    }

    @Test
    void onMessage_truncatesOverlongErrorMessages() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString()))
                .thenThrow(new IOException("x".repeat(5000)));

        worker.onMessage(message());

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(indexJobRepository).markFailed(eq(JOB_ID), eq(JobStatus.FAILED), any(), captor.capture());

        // error_message is a bounded column; an unbounded stack message would
        // fail the very update that records the failure.
        assertThat(captor.getValue()).hasSize(2000);
    }

    @Test
    void onMessage_recordsAPlaceholderWhenTheFailureHasNoMessage() throws IOException {
        jobStaysRunning();
        when(storageClient.fetchText(anyString(), anyString(), anyString()))
                .thenThrow(new NullPointerException());

        worker.onMessage(message());

        // error_message is what the API shows the caller; null tells them nothing.
        verify(indexJobRepository).markFailed(eq(JOB_ID), eq(JobStatus.FAILED), any(), eq("Unknown error"));
    }
}
