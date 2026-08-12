package com.ragflow.retrieval.service.impl;

import com.ragflow.retrieval.dto.ScoredChunk;
import com.ragflow.retrieval.dto.response.SearchSimulationResponse;
import com.ragflow.retrieval.dto.response.SimulatedSearchResult;
import com.ragflow.retrieval.dto.RankedChunk;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.service.KeywordSearchService;
import com.ragflow.retrieval.service.RrfRanker;
import com.ragflow.retrieval.service.SearchSimulationService;
import com.ragflow.retrieval.service.VectorSearchService;
import com.ragflow.retrieval.util.Constants;
import com.ragflow.retrieval.util.DebugAssembler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Runs a search and reports how each result was scored, so an admin can see why
 * a chunk ranked where it did.
 *
 * <p>Coding to the {@link KeywordSearchService} / {@link VectorSearchService}
 * interfaces means this class is unaffected by whether they are backed by real
 * search or by local sample data. {@code RrfRanker} and {@code DebugAssembler}
 * are always real.
 *
 * <p>Both searches are injected as {@link Optional} because outside local
 * development neither has an implementation yet. That absence must not stop the
 * service starting — the rest of its API works without search — so it is
 * reported per request instead, as a 503.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchSimulationServiceImpl implements SearchSimulationService {

    private final Optional<KeywordSearchService> keywordSearchService;
    private final Optional<VectorSearchService> vectorSearchService;
    private final RrfRanker rrfRanker;
    private final DebugAssembler debugAssembler;

    @Override
    public SearchSimulationResponse simulate(String query, int topK) {

        log.info("Search simulation started. query='{}', topK={}", query, topK);

        KeywordSearchService keywordSearch = keywordSearchService.orElseThrow(this::searchUnavailable);
        VectorSearchService vectorSearch = vectorSearchService.orElseThrow(this::searchUnavailable);

        List<ScoredChunk> keywordResults = keywordSearch.search(query, topK);
        log.debug("Keyword search returned {} result(s).", keywordResults.size());

        List<ScoredChunk> vectorResults = vectorSearch.search(query, topK);
        log.debug("Vector search returned {} result(s).", vectorResults.size());

        List<RankedChunk> ranked = rrfRanker.fuse(keywordResults, vectorResults);
        log.debug("RRF ranking completed. Ranked {} chunk(s).", ranked.size());

        List<SimulatedSearchResult> results = debugAssembler.assemble(ranked);

        log.info("Search simulation completed successfully. Returning {} result(s).", results.size());

        return new SearchSimulationResponse(query, results);
    }

    /**
     * Signals that no search implementation is wired in this environment. Logged
     * at ERROR because it means the endpoint is unusable, which is a deployment
     * fault rather than a bad request.
     */
    private BusinessException searchUnavailable() {
        log.error("Search simulation unavailable: no keyword/vector search implementation is present. "
                + "Run with the '{}' profile to use local sample data.", Constants.LOCAL_PROFILE);
        return new BusinessException(ErrorCode.SEARCH_BACKEND_UNAVAILABLE);
    }
}
