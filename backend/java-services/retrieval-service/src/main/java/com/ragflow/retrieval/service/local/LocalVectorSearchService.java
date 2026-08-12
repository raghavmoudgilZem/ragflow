package com.ragflow.retrieval.service.local;

import com.ragflow.retrieval.dto.ScoredChunk;
import com.ragflow.retrieval.service.VectorSearchService;
import com.ragflow.retrieval.util.Constants;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Fixed sample results, so the retrieval pipeline can be developed and demoed
 * before real vector search exists.
 *
 * <p>Returns the same chunks for every call and ignores both arguments — no
 * embedding is computed and nothing is searched. Restricted to the local profile
 * because results this convincing are dangerous outside it: served in a real
 * environment they would look like a working search rather than an outage.
 */
@Profile(Constants.LOCAL_PROFILE)
@Service
public class LocalVectorSearchService implements VectorSearchService {

    @Override
    public List<ScoredChunk> search(String query, int topK) {
        return List.of(
                new ScoredChunk(
                        "chunk-002",
                        "doc-001",
                        "kb-001",
                        "Our refund policy covers items returned within 30 days.",
                        0.91
                ),
                new ScoredChunk(
                        "chunk-003",
                        "doc-003",
                        "kb-002",
                        "Shipping refunds require the original receipt.",
                        0.87
                ),
                new ScoredChunk(
                        "chunk-004",
                        "doc-002",
                        "kb-003",
                        "Policy changes are communicated via email 14 days in advance.",
                        0.79
                )
        );
    }
}
