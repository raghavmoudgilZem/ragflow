package com.ragflow.retrieval.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.retrieval.dto.request.SearchAppCreateRequest;
import com.ragflow.retrieval.dto.response.SearchDetailResponse;
import com.ragflow.retrieval.dto.response.SearchPageResponse;
import com.ragflow.retrieval.dto.response.SearchSimulationResponse;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.exception.RetrievalException;
import com.ragflow.retrieval.exception.ResourceNotFoundException;
import com.ragflow.retrieval.service.SearchService;
import com.ragflow.retrieval.service.SearchSimulationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
@AutoConfigureMockMvc(addFilters = false)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SearchService searchService;

    @MockitoBean
    private SearchSimulationService searchSimulationService;


    @Nested
    @DisplayName("GET /api/v1/search/simulate")
    class SimulateSearch {

        @Test
        @DisplayName("Should return 200 OK when request is valid")
        void shouldReturnSearchSimulationResponse() throws Exception {

            SearchSimulationResponse response =
                    new SearchSimulationResponse("refund", List.of());

            when(searchSimulationService.simulate("refund", 10))
                    .thenReturn(response);

            mockMvc.perform(get("/api/v1/search/simulate")
                            .param("q", "refund")
                            .param("topK", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.query").value("refund"))
                    .andExpect(jsonPath("$.results").isArray());

            verify(searchSimulationService).simulate("refund", 10);
        }

        @Test
        @DisplayName("Should use default topK when parameter is omitted")
        void shouldUseDefaultTopK() throws Exception {

            SearchSimulationResponse response =
                    new SearchSimulationResponse("refund", List.of());

            when(searchSimulationService.simulate("refund", 10))
                    .thenReturn(response);

            mockMvc.perform(get("/api/v1/search/simulate")
                            .param("q", "refund"))
                    .andExpect(status().isOk());

            verify(searchSimulationService).simulate("refund", 10);
        }

        @Test
        @DisplayName("Should return 400 when query is blank")
        void shouldReturnBadRequestWhenQueryIsBlank() throws Exception {

            mockMvc.perform(get("/api/v1/search/simulate")
                            .param("q", "")
                            .param("topK", "10"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(searchSimulationService);
        }

        @Test
        @DisplayName("Should return 400 when topK is negative")
        void shouldReturnBadRequestWhenTopKIsNegative() throws Exception {

            mockMvc.perform(get("/api/v1/search/simulate")
                            .param("q", "refund")
                            .param("topK", "-2"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(searchSimulationService);
        }

        @Test
        @DisplayName("Should return 400 when topK is zero")
        void shouldReturnBadRequestWhenTopKIsZero() throws Exception {

            mockMvc.perform(get("/api/v1/search/simulate")
                            .param("q", "refund")
                            .param("topK", "0"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(searchSimulationService);
        }

        @Test
        @DisplayName("Should return 500 when service throws unexpected exception")
        void shouldReturnInternalServerErrorWhenServiceThrowsException() throws Exception {

            when(searchSimulationService.simulate(anyString(), anyInt()))
                    .thenThrow(new RuntimeException("Unexpected error"));

            mockMvc.perform(get("/api/v1/search/simulate")
                            .param("q", "refund")
                            .param("topK", "10"))
                    .andExpect(status().isInternalServerError());
        }

        /**
         * Security tests are intentionally skipped because
         * role-based authorization is currently disabled:
         *
         * //@PreAuthorize("hasAnyRole('ADMIN', 'BUILDER')")
         *
         * Once enabled, add tests for:
         *
         * - ADMIN -> 200 OK
         * - BUILDER -> 200 OK
         * - USER -> 403 Forbidden
         * - Anonymous -> 401 Unauthorized
         */
    }
}
