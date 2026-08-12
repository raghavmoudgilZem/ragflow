package com.ragflow.retrieval.util;

import com.ragflow.retrieval.dto.response.DebugInfo;
import com.ragflow.retrieval.dto.response.SimulatedSearchResult;
import com.ragflow.retrieval.dto.RankedChunk;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Maps RrfRanker's output (RankedChunk) to the API's _debug response shape.
 */
@Component
public class DebugAssembler {

    public List<SimulatedSearchResult> assemble(List<RankedChunk> rankedChunks) {
        return rankedChunks.stream().map(this::toResult).collect(Collectors.toList());
    }

    private SimulatedSearchResult toResult(RankedChunk chunk) {
        DebugInfo debug = new DebugInfo(
                chunk.rawVectorScore(),
                chunk.rawBm25Score(),
                matchedKeywords(chunk),
                chunk.rrfScore()
        );
        return new SimulatedSearchResult(chunk.chunkId(), chunk.content(), debug);
    }

    /**
     * PLACEHOLDER — see LLD open question #1: neither ScoredChunk (257) nor
     * KeywordSearchService (254, undocumented) currently exposes term-level
     * matches. Faking it here so the field exists in the response shape;
     * swap for real term extraction once 254 defines where it comes from.
     */
    private List<String> matchedKeywords(RankedChunk chunk) {
        if (chunk.rawBm25Score() == null) {
            return List.of(); // chunk wasn't in the keyword list at all
        }
        return List.of("placeholder-keyword");
    }
}