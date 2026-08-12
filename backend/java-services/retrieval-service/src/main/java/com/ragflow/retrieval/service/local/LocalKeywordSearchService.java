package com.ragflow.retrieval.service.local;

import com.ragflow.retrieval.dto.ScoredChunk;
import com.ragflow.retrieval.service.KeywordSearchService;
import com.ragflow.retrieval.util.Constants;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Fixed sample results, so the retrieval pipeline can be developed and demoed
 * before real keyword search exists.
 *
 * <p>Returns the same chunks for every call and ignores both arguments — it does
 * not search anything. Restricted to the local profile because results this
 * convincing are dangerous outside it: served in a real environment they would
 * look like a working search rather than an outage.
 */
@Profile(Constants.LOCAL_PROFILE)
@Service
public class LocalKeywordSearchService implements KeywordSearchService {

    @Override
    public List<ScoredChunk> search(String query, int topK) {
        return List.of(
                new ScoredChunk(
                        "chunk-001",
                        "doc-001",
                        "kb-001",
                        "Refunds are processed within 5 business days of approval.",
                        14.82
                ),
                new ScoredChunk(
                        "chunk-002",
                        "doc-001",
                        "kb-002",
                        "Our refund policy covers items returned within 30 days.",
                        11.35
                ),
                new ScoredChunk(
                        "chunk-004",
                        "doc-002",
                        "kb-003",
                        "Policy changes are communicated via email 14 days in advance.",
                        6.02
                )
        );
    }
}
