package com.ragflow.retrieval.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ErrorCause;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.DeleteByQueryRequest;
import co.elastic.clients.elasticsearch.core.DeleteByQueryResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;
import co.elastic.clients.elasticsearch.core.bulk.OperationType;
import co.elastic.clients.elasticsearch.indices.CreateIndexResponse;
import co.elastic.clients.elasticsearch.indices.ElasticsearchIndicesClient;
import co.elastic.clients.elasticsearch.indices.ExistsRequest;
import co.elastic.clients.elasticsearch.indices.GetMappingResponse;
import co.elastic.clients.elasticsearch.indices.PutMappingResponse;
import co.elastic.clients.elasticsearch.indices.get_mapping.IndexMappingRecord;
import co.elastic.clients.transport.endpoints.BooleanResponse;

import com.ragflow.retrieval.util.ElasticsearchChunkWriter.ChunkDocument;

/**
 * All writes into the tenant index go through here, so the tests cover what a
 * caller cannot check for itself: that {@code ensureIndex} adds a missing vector
 * field instead of assuming one index per model, that a partially failed bulk is
 * reported as a failure rather than swallowed (silently losing chunks would
 * leave a job marked SUCCEEDED with holes in it), and that deleting a document's
 * chunks tolerates a tenant index that does not exist yet.
 *
 * <p>Elasticsearch's response types are final all the way down, so the fixtures
 * below build real responses rather than mocking them.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ElasticsearchChunkWriterTest {

    private static final String TENANT_ID = "tenant-1";
    private static final String INDEX = "ragflow_tenant-1";

    @Mock
    private ElasticsearchClient client;

    @Mock
    private ElasticsearchIndicesClient indicesClient;

    private ElasticsearchChunkWriter writer;

    @BeforeEach
    void setUp() {
        when(client.indices()).thenReturn(indicesClient);
        writer = new ElasticsearchChunkWriter(client, "ragflow_");
    }

    // ---------------------------------------------------------------- helpers

    private static ChunkDocument document(String chunkId) {
        return new ChunkDocument(chunkId, TENANT_ID, "kb-1", "doc-1", "handbook.pdf",
                "chunk text", "q_768_vec", new float[] {0.1f, 0.2f},
                "2026-07-30 10:15:30", 1785_060_930.0d);
    }

    private void indexExists(boolean exists) throws IOException {
        when(indicesClient.exists(any(ExistsRequest.class))).thenReturn(new BooleanResponse(exists));
    }

    private static BulkResponse successfulBulk() {
        return BulkResponse.of(b -> b.errors(false).took(5).items(List.of()));
    }

    private static BulkResponse bulkWithItemError(String failedId, String reason) {
        BulkResponseItem ok = BulkResponseItem.of(i -> i
                .id("c1").index(INDEX).operationType(OperationType.Index).status(201));
        BulkResponseItem failed = BulkResponseItem.of(i -> i
                .id(failedId).index(INDEX).operationType(OperationType.Index).status(400)
                .error(ErrorCause.of(e -> e.type(reason).reason(reason))));

        return BulkResponse.of(b -> b.errors(true).took(5).items(List.of(ok, failed)));
    }

    private static GetMappingResponse mappingWithFields(String... fields) {
        IndexMappingRecord record = IndexMappingRecord.of(r -> r.mappings(m -> {
            for (String field : fields) {
                m.properties(field, p -> p.keyword(k -> k));
            }
            return m;
        }));

        return GetMappingResponse.of(g -> g.result(INDEX, record));
    }

    // ------------------------------------------------------------- index name

    @Test
    void indexNameFor_prefixesTheTenantId() {
        // One index per tenant is the isolation boundary for every read and
        // write below.
        assertThat(writer.indexNameFor(TENANT_ID)).isEqualTo(INDEX);
        assertThat(writer.indexNameFor("other")).isEqualTo("ragflow_other");
    }

    // ------------------------------------------------------------ ensureIndex

    @Test
    @SuppressWarnings("unchecked")
    void ensureIndex_createsTheIndexWhenItDoesNotExist() throws IOException {
        indexExists(false);
        when(indicesClient.create(any(Function.class))).thenReturn(
                CreateIndexResponse.of(c -> c.index(INDEX).acknowledged(true).shardsAcknowledged(true)));

        writer.ensureIndex(TENANT_ID, 768);

        verify(indicesClient).create(any(Function.class));
        // Nothing to inspect or patch on a fresh index.
        verify(indicesClient, never()).getMapping(any(Function.class));
        verify(indicesClient, never()).putMapping(any(Function.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void ensureIndex_addsTheVectorFieldWhenTheIndexLacksIt() throws IOException {
        indexExists(true);
        when(indicesClient.getMapping(any(Function.class))).thenReturn(mappingWithFields("content_with_weight"));
        when(indicesClient.putMapping(any(Function.class))).thenReturn(
                PutMappingResponse.of(p -> p.acknowledged(true)));

        writer.ensureIndex(TENANT_ID, 1024);

        // A second embedding dimension in an existing tenant index: the new
        // field is added rather than the index being recreated.
        verify(indicesClient).putMapping(any(Function.class));
        verify(indicesClient, never()).create(any(Function.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void ensureIndex_isANoOpWhenTheVectorFieldIsAlreadyMapped() throws IOException {
        indexExists(true);
        when(indicesClient.getMapping(any(Function.class))).thenReturn(mappingWithFields("q_768_vec"));

        writer.ensureIndex(TENANT_ID, 768);

        // Called once per job, so the common case must not touch the mapping.
        verify(indicesClient, never()).putMapping(any(Function.class));
        verify(indicesClient, never()).create(any(Function.class));
    }

    @Test
    void ensureIndex_propagatesFailures() throws IOException {
        when(indicesClient.exists(any(ExistsRequest.class))).thenThrow(new IOException("cluster unreachable"));

        // The worker turns this into a FAILED job; swallowing it would index
        // into a nonexistent or wrongly mapped index.
        assertThatThrownBy(() -> writer.ensureIndex(TENANT_ID, 768))
                .isInstanceOf(IOException.class)
                .hasMessage("cluster unreachable");
    }

    // --------------------------------------------------------------- bulkIndex

    @Test
    void bulkIndex_sendsOneIndexOperationPerChunkIntoTheTenantIndex() throws IOException {
        when(client.bulk(any(BulkRequest.class))).thenReturn(successfulBulk());

        writer.bulkIndex(TENANT_ID, List.of(document("c1"), document("c2")));

        ArgumentCaptor<BulkRequest> captor = ArgumentCaptor.forClass(BulkRequest.class);
        verify(client).bulk(captor.capture());
        List<BulkOperation> operations = captor.getValue().operations();

        assertThat(operations).hasSize(2);
        // The chunk id is the document id: that is what makes a rewrite of
        // unchanged content an upsert instead of a duplicate.
        assertThat(operations.get(0).index().id()).isEqualTo("c1");
        assertThat(operations.get(0).index().index()).isEqualTo(INDEX);
        assertThat(operations.get(1).index().id()).isEqualTo("c2");
    }

    @Test
    @SuppressWarnings("unchecked")
    void bulkIndex_writesTheDocumentFieldsTheMappingExpects() throws IOException {
        when(client.bulk(any(BulkRequest.class))).thenReturn(successfulBulk());

        writer.bulkIndex(TENANT_ID, List.of(document("c1")));

        ArgumentCaptor<BulkRequest> captor = ArgumentCaptor.forClass(BulkRequest.class);
        verify(client).bulk(captor.capture());
        Map<String, Object> document = (Map<String, Object>) captor.getValue()
                .operations().get(0).index().document();

        assertThat(document).containsEntry("tenant_id", TENANT_ID)
                .containsEntry("kb_id", "kb-1")
                .containsEntry("doc_id", "doc-1")
                .containsEntry("chunk_id", "c1")
                .containsEntry("docnm_kwd", "handbook.pdf")
                .containsEntry("content_with_weight", "chunk text")
                .containsEntry("create_time", "2026-07-30 10:15:30")
                .containsKey("create_timestamp_flt");
        // The vector lives under its dimension-specific field name.
        assertThat(document).containsKey("q_768_vec");
    }

    @Test
    void bulkIndex_doesNothingForAnEmptyBatch() throws IOException {
        writer.bulkIndex(TENANT_ID, List.of());

        // An empty bulk request is a 400 from Elasticsearch, so the guard is
        // load-bearing for zero-chunk documents.
        verify(client, never()).bulk(any(BulkRequest.class));
    }

    @Test
    void bulkIndex_throwsWhenAnyItemFailed() throws IOException {
        when(client.bulk(any(BulkRequest.class))).thenReturn(bulkWithItemError("c2", "mapper_parsing_exception"));

        // Partial success is a failure: the caller must be able to mark the job
        // FAILED rather than claim every chunk was written.
        assertThatThrownBy(() -> writer.bulkIndex(TENANT_ID, List.of(document("c1"), document("c2"))))
                .isInstanceOf(IOException.class)
                .hasMessageContaining("Bulk index had failures")
                .hasMessageContaining("c2")
                .hasMessageContaining("mapper_parsing_exception");
    }

    @Test
    void bulkIndex_propagatesTransportFailures() throws IOException {
        when(client.bulk(any(BulkRequest.class))).thenThrow(new IOException("connection reset"));

        assertThatThrownBy(() -> writer.bulkIndex(TENANT_ID, List.of(document("c1"))))
                .isInstanceOf(IOException.class)
                .hasMessage("connection reset");
    }

    // ----------------------------------------------------------- deleteByDocId

    @Test
    void deleteByDocId_returnsTheDeletedCount() throws IOException {
        when(client.deleteByQuery(any(DeleteByQueryRequest.class)))
                .thenReturn(DeleteByQueryResponse.of(d -> d.deleted(12L)));

        assertThat(writer.deleteByDocId(TENANT_ID, "doc-1")).isEqualTo(12L);
    }

    @Test
    void deleteByDocId_targetsTheTenantIndexAndTheGivenDoc() throws IOException {
        when(client.deleteByQuery(any(DeleteByQueryRequest.class)))
                .thenReturn(DeleteByQueryResponse.of(d -> d.deleted(0L)));

        writer.deleteByDocId(TENANT_ID, "doc-1");

        ArgumentCaptor<DeleteByQueryRequest> captor = ArgumentCaptor.forClass(DeleteByQueryRequest.class);
        verify(client).deleteByQuery(captor.capture());
        assertThat(captor.getValue().index()).containsExactly(INDEX);
        // A term query on doc_id: a match query would delete other documents'
        // chunks whose text merely analysed to the same tokens.
        assertThat(captor.getValue().query().isTerm()).isTrue();
        assertThat(captor.getValue().query().term().field()).isEqualTo("doc_id");
        assertThat(captor.getValue().query().term().value().stringValue()).isEqualTo("doc-1");
    }

    @Test
    void deleteByDocId_toleratesAMissingTenantIndex() throws IOException {
        when(client.deleteByQuery(any(DeleteByQueryRequest.class)))
                .thenReturn(DeleteByQueryResponse.of(d -> d.deleted(0L)));

        writer.deleteByDocId(TENANT_ID, "doc-1");

        ArgumentCaptor<DeleteByQueryRequest> captor = ArgumentCaptor.forClass(DeleteByQueryRequest.class);
        verify(client).deleteByQuery(captor.capture());
        // The indexing pipeline clears a doc's old chunks before rewriting it,
        // including on a tenant's very first job where no index exists yet —
        // without this flag that call would fail the job with index_not_found.
        assertThat(captor.getValue().ignoreUnavailable()).isTrue();
    }

    @Test
    void deleteByDocId_reportsZeroWhenTheCountIsAbsent() throws IOException {
        when(client.deleteByQuery(any(DeleteByQueryRequest.class)))
                .thenReturn(DeleteByQueryResponse.of(d -> d));

        // Null means "not reported", which must not surface as a null Long to
        // the caller.
        assertThat(writer.deleteByDocId(TENANT_ID, "doc-1")).isZero();
    }

    @Test
    void deleteByDocId_propagatesFailures() throws IOException {
        when(client.deleteByQuery(any(DeleteByQueryRequest.class)))
                .thenThrow(new IOException("delete_by_query rejected"));

        // The pipeline depends on this surfacing: writing new chunks on top of
        // chunks that could not be cleared is what the purge exists to prevent.
        assertThatThrownBy(() -> writer.deleteByDocId(TENANT_ID, "doc-1"))
                .isInstanceOf(IOException.class);
    }
}
