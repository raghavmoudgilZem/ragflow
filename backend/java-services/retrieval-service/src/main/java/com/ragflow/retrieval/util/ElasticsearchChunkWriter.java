package com.ragflow.retrieval.util;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.mapping.DenseVectorProperty;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch._types.mapping.TextProperty;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.DeleteByQueryRequest;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;
import co.elastic.clients.elasticsearch.indices.ExistsRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Owns all writes into Elasticsearch, the sole source of truth for chunk
 * text and vectors (per the design doc — rag_db/MySQL never duplicates
 * this data). One index per tenant: ragflow_{tenantId}.
 *
 * Field names mirror the mapping sketch in the doc:
 *   tenant_id, kb_id, doc_id, chunk_id, docnm_kwd -> keyword
 *   content_with_weight                 -> text, BM25 similarity
 *   create_time                         -> index-time stamp, string
 *   create_timestamp_flt                -> index-time stamp, epoch seconds
 *                                          (both dynamically mapped by ES)
 *   q_{dim}_vec                         -> dense_vector, cosine similarity
 *                                          (one field per embedding dim in use)
 */
@Component
public class ElasticsearchChunkWriter {

    private final ElasticsearchClient client;
    private final String indexPrefix;

    public ElasticsearchChunkWriter(
            ElasticsearchClient client,
            @Value("${rag.elasticsearch.index-prefix}") String indexPrefix) {
        this.client = client;
        this.indexPrefix = indexPrefix;
    }

    public String indexNameFor(String tenantId) {
        return indexPrefix + tenantId;
    }

    /**
     * Ensures the tenant's index exists with the vector field for the given
     * dimension present. Safe to call repeatedly; only creates/updates
     * mapping when the field is genuinely missing.
     */
    public void ensureIndex(String tenantId, int vectorDim) throws IOException {
        String indexName = indexNameFor(tenantId);
        boolean exists = client.indices()
                .exists(ExistsRequest.of(e -> e.index(indexName)))
                .value();

        String vectorField = "q_" + vectorDim + "_vec";

        if (!exists) {
            client.indices().create(c -> c
                    .index(indexName)
                    .mappings(m -> m
                            .properties("tenant_id", Property.of(p -> p.keyword(k -> k)))
                            .properties("kb_id", Property.of(p -> p.keyword(k -> k)))
                            .properties("doc_id", Property.of(p -> p.keyword(k -> k)))
                            .properties("chunk_id", Property.of(p -> p.keyword(k -> k)))
                            .properties("docnm_kwd", Property.of(p -> p.keyword(k -> k)))
                            .properties("content_with_weight", Property.of(p -> p.text(TextProperty.of(t -> t))))
                            .properties(vectorField, Property.of(p -> p.denseVector(
                                    DenseVectorProperty.of(d -> d
                                            .dims(vectorDim)
                                            .similarity("cosine")
                                            .index(true)))))));
            return;
        }

        // Index exists (shared across models of different dims for this
        // tenant) — check whether this dim's vector field is present, add
        // it if not. Elasticsearch allows adding new fields to an existing
        // mapping without reindexing.
        var mapping = client.indices().getMapping(g -> g.index(indexName));
        boolean hasVectorField = mapping.result().values().stream()
                .anyMatch(idx -> idx.mappings() != null
                        && idx.mappings().properties() != null
                        && idx.mappings().properties().containsKey(vectorField));

        if (!hasVectorField) {
            client.indices().putMapping(m -> m
                    .index(indexName)
                    .properties(vectorField, Property.of(p -> p.denseVector(
                            DenseVectorProperty.of(d -> d
                                    .dims(vectorDim)
                                    .similarity("cosine")
                                    .index(true))))));
        }
    }

    /**
     * Bulk-indexes a batch of chunks. Throws if any individual item fails
     * so the caller can mark the job FAILED rather than silently losing
     * chunks.
     */
    public void bulkIndex(String tenantId, List<ChunkDocument> chunks) throws IOException {
        if (chunks.isEmpty()) return;

        String indexName = indexNameFor(tenantId);

        BulkRequest.Builder br = new BulkRequest.Builder();
        for (ChunkDocument chunk : chunks) {
            br.operations(op -> op.index(idx -> idx
                    .index(indexName)
                    .id(chunk.chunkId())
                    .document(chunk.toDocumentMap())));
        }

        BulkResponse response = client.bulk(br.build());
        if (response.errors()) {
            StringBuilder sb = new StringBuilder("Bulk index had failures: ");
            for (BulkResponseItem item : response.items()) {
                if (item.error() != null) {
                    sb.append(item.id()).append(": ").append(item.error().reason()).append("; ");
                }
            }
            throw new IOException(sb.toString());
        }
    }

    /**
     * Backs A4 · Delete document chunks, and is also how the indexing pipeline
     * clears a document's previous chunks before rewriting it.
     *
     * <p>A tenant whose index does not exist yet simply has nothing to delete,
     * so a missing index is not an error here — that case is reached whenever
     * the very first job for a tenant has nothing to write.
     */
    public long deleteByDocId(String tenantId, String docId) throws IOException {
        String indexName = indexNameFor(tenantId);
        Query query = Query.of(q -> q.term(t -> t.field("doc_id").value(docId)));
        var response = client.deleteByQuery(DeleteByQueryRequest.of(d -> d
                .index(indexName)
                .ignoreUnavailable(true)
                .query(query)));
        return response.deleted() == null ? 0 : response.deleted();
    }

    /**
     * A single chunk ready to be written to ES. vectorFieldName/vector are
     * kept generic since the field name depends on the embedding model's
     * dimension (q_1024_vec, q_1536_vec, etc).
     */
    public record ChunkDocument(
            String chunkId,
            String tenantId,
            String kbId,
            String docId,
            String docName,
            String content,
            String vectorFieldName,
            float[] vector,
            String createTime,
            double createTimestampFlt) {

        Map<String, Object> toDocumentMap() {
            // A mutable map rather than Map.of(): the vector field name is
            // dynamic, and upcoming optional fields (img_id, positions) are
            // written only when present, which Map.of() cannot express.
            Map<String, Object> doc = new HashMap<>();
            doc.put("tenant_id", tenantId);
            doc.put("kb_id", kbId);
            doc.put("doc_id", docId);
            doc.put("chunk_id", chunkId);
            doc.put("docnm_kwd", docName);
            doc.put("content_with_weight", content);
            doc.put("create_time", createTime);
            doc.put("create_timestamp_flt", createTimestampFlt);
            doc.put(vectorFieldName, vector);
            return doc;
        }
    }
}