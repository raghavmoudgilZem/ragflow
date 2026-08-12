package com.ragflow.retrieval.service.Impl;

import java.util.Optional;

import com.ragflow.retrieval.dto.RankedChunk;
import com.ragflow.retrieval.dto.ScoredChunk;
import com.ragflow.retrieval.dto.response.SearchSimulationResponse;
import com.ragflow.retrieval.dto.response.SimulatedSearchResult;
import com.ragflow.retrieval.service.KeywordSearchService;
import com.ragflow.retrieval.service.RrfRanker;
import com.ragflow.retrieval.service.VectorSearchService;
import com.ragflow.retrieval.service.impl.SearchSimulationServiceImpl;
import com.ragflow.retrieval.util.DebugAssembler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link SearchSimulationServiceImpl}.
 *
 * These tests mock the KeywordSearchService and VectorSearchService (the
 * "swappable" collaborators) as well as RrfRanker and DebugAssembler, since
 * this class is only responsible for orchestrating calls to them, not for
 * their internal logic.
 *
 * NOTE: Since the internal fields/constructors of ScoredChunk, RankedChunk,
 * and SimulatedSearchResult are not shown in the class under test, this
 * suite uses Mockito mocks to stand in for instances of those DTOs wherever
 * a concrete object is needed. Replace `mock(ScoredChunk.class)` etc. with
 * real builder/constructor calls if those types are final or otherwise
 * un-mockable in your codebase.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SearchSimulationServiceImpl")
class SearchSimulationServiceImplTest {

    @Mock
    private KeywordSearchService keywordSearchService;

    @Mock
    private VectorSearchService vectorSearchService;

    @Mock
    private RrfRanker rrfRanker;

    @Mock
    private DebugAssembler debugAssembler;

    private SearchSimulationServiceImpl searchSimulationService;

    @BeforeEach
    void setUp() {
        // The searches are Optional because outside the local profile no
        // implementation exists yet; here both are present.
        searchSimulationService = new SearchSimulationServiceImpl(
                Optional.of(keywordSearchService),
                Optional.of(vectorSearchService),
                rrfRanker,
                debugAssembler
        );
    }

    @Nested
    @DisplayName("simulate()")
    class Simulate {

        @Test
        @DisplayName("orchestrates keyword search, vector search, RRF fusion, and assembly in order")
        void callsCollaboratorsInExpectedOrder() {
            String query = "how does retrieval augmented generation work";
            int topK = 5;

            List<ScoredChunk> keywordResults = List.of(mock(ScoredChunk.class), mock(ScoredChunk.class));
            List<ScoredChunk> vectorResults = List.of(mock(ScoredChunk.class));
            List<RankedChunk> rankedChunks = List.of(mock(RankedChunk.class), mock(RankedChunk.class));
            List<SimulatedSearchResult> assembledResults = List.of(mock(SimulatedSearchResult.class));

            when(keywordSearchService.search(query, topK)).thenReturn(keywordResults);
            when(vectorSearchService.search(query, topK)).thenReturn(vectorResults);
            when(rrfRanker.fuse(keywordResults, vectorResults)).thenReturn(rankedChunks);
            when(debugAssembler.assemble(rankedChunks)).thenReturn(assembledResults);

            SearchSimulationResponse response = searchSimulationService.simulate(query, topK);

            assertThat(response).isNotNull();
            assertThat(response.query()).isEqualTo(query);
            assertThat(response.results()).isEqualTo(assembledResults);

            InOrder inOrder = inOrder(keywordSearchService, vectorSearchService, rrfRanker, debugAssembler);
            inOrder.verify(keywordSearchService).search(query, topK);
            inOrder.verify(vectorSearchService).search(query, topK);
            inOrder.verify(rrfRanker).fuse(keywordResults, vectorResults);
            inOrder.verify(debugAssembler).assemble(rankedChunks);
        }

        @Test
        @DisplayName("passes the same query and topK to both keyword and vector search")
        void passesSameQueryAndTopKToBothSearches() {
            String query = "vector databases";
            int topK = 10;

            when(keywordSearchService.search(anyString(), anyInt())).thenReturn(Collections.emptyList());
            when(vectorSearchService.search(anyString(), anyInt())).thenReturn(Collections.emptyList());
            when(rrfRanker.fuse(anyList(), anyList())).thenReturn(Collections.emptyList());
            when(debugAssembler.assemble(anyList())).thenReturn(Collections.emptyList());

            searchSimulationService.simulate(query, topK);

            verify(keywordSearchService).search(eq(query), eq(topK));
            verify(vectorSearchService).search(eq(query), eq(topK));
        }

        @Test
        @DisplayName("returns an empty result list when no chunks are found or ranked")
        void returnsEmptyResultsWhenNothingFound() {
            String query = "an obscure query with no matches";
            int topK = 3;

            when(keywordSearchService.search(query, topK)).thenReturn(Collections.emptyList());
            when(vectorSearchService.search(query, topK)).thenReturn(Collections.emptyList());
            when(rrfRanker.fuse(Collections.emptyList(), Collections.emptyList()))
                    .thenReturn(Collections.emptyList());
            when(debugAssembler.assemble(Collections.emptyList())).thenReturn(Collections.emptyList());

            SearchSimulationResponse response = searchSimulationService.simulate(query, topK);

            assertThat(response.query()).isEqualTo(query);
            assertThat(response.results()).isEmpty();
        }

        @Test
        @DisplayName("propagates the query string unchanged into the response, even for edge-case inputs")
        void preservesQueryStringExactly() {
            String query = "   weird   query with \t whitespace \n and symbols !@# ";
            int topK = 1;

            when(keywordSearchService.search(query, topK)).thenReturn(Collections.emptyList());
            when(vectorSearchService.search(query, topK)).thenReturn(Collections.emptyList());
            when(rrfRanker.fuse(anyList(), anyList())).thenReturn(Collections.emptyList());
            when(debugAssembler.assemble(anyList())).thenReturn(Collections.emptyList());

            SearchSimulationResponse response = searchSimulationService.simulate(query, topK);

            assertThat(response.query()).isEqualTo(query);
        }

        @Test
        @DisplayName("propagates a RuntimeException thrown by the keyword search service")
        void propagatesKeywordSearchException() {
            String query = "failing query";
            int topK = 5;

            when(keywordSearchService.search(query, topK))
                    .thenThrow(new RuntimeException("keyword search backend unavailable"));

            org.junit.jupiter.api.Assertions.assertThrows(
                    RuntimeException.class,
                    () -> searchSimulationService.simulate(query, topK)
            );

            verify(vectorSearchService, never()).search(anyString(), anyInt());
            verifyNoInteractions(rrfRanker, debugAssembler);
        }

        @Test
        @DisplayName("propagates a RuntimeException thrown by the vector search service")
        void propagatesVectorSearchException() {
            String query = "failing query";
            int topK = 5;

            when(keywordSearchService.search(query, topK)).thenReturn(Collections.emptyList());
            when(vectorSearchService.search(query, topK))
                    .thenThrow(new RuntimeException("vector search backend unavailable"));

            org.junit.jupiter.api.Assertions.assertThrows(
                    RuntimeException.class,
                    () -> searchSimulationService.simulate(query, topK)
            );

            verifyNoInteractions(rrfRanker, debugAssembler);
        }

        @Test
        @DisplayName("propagates a RuntimeException thrown by the RRF ranker")
        void propagatesRrfRankerException() {
            String query = "failing query";
            int topK = 5;

            List<ScoredChunk> keywordResults = Collections.emptyList();
            List<ScoredChunk> vectorResults = Collections.emptyList();

            when(keywordSearchService.search(query, topK)).thenReturn(keywordResults);
            when(vectorSearchService.search(query, topK)).thenReturn(vectorResults);
            when(rrfRanker.fuse(keywordResults, vectorResults))
                    .thenThrow(new RuntimeException("fusion failed"));

            org.junit.jupiter.api.Assertions.assertThrows(
                    RuntimeException.class,
                    () -> searchSimulationService.simulate(query, topK)
            );

            verifyNoInteractions(debugAssembler);
        }

        @Test
        @DisplayName("does not call debugAssembler before rrfRanker has produced a result")
        void debugAssemblerReceivesRankerOutputDirectly() {
            String query = "ordering check";
            int topK = 2;

            List<ScoredChunk> keywordResults = List.of(mock(ScoredChunk.class));
            List<ScoredChunk> vectorResults = List.of(mock(ScoredChunk.class));
            List<RankedChunk> rankedChunks = List.of(mock(RankedChunk.class));

            when(keywordSearchService.search(query, topK)).thenReturn(keywordResults);
            when(vectorSearchService.search(query, topK)).thenReturn(vectorResults);
            when(rrfRanker.fuse(keywordResults, vectorResults)).thenReturn(rankedChunks);
            when(debugAssembler.assemble(rankedChunks)).thenReturn(Collections.emptyList());

            searchSimulationService.simulate(query, topK);

            verify(debugAssembler).assemble(rankedChunks);
            verify(rrfRanker, times(1)).fuse(keywordResults, vectorResults);
        }
    }
}