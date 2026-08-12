package com.ragflow.retrieval.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.retrieval.dto.request.SearchConfigurationRequest;
import com.ragflow.retrieval.dto.response.SearchConfigurationResponse;
import com.ragflow.retrieval.service.SearchConfigurationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SearchConfigurationController.class)
@DisplayName("SearchConfigurationController Tests")
@AutoConfigureMockMvc(addFilters = false)
class SearchConfigurationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SearchConfigurationService service;

    @Nested
    @DisplayName("GET /api/v1/config/weights")
    class GetConfiguration {

        @Test
        @DisplayName("should return search configuration")
        void shouldReturnSearchConfiguration() throws Exception {

            // Arrange
            SearchConfigurationResponse response = new SearchConfigurationResponse(0.75,0.30,0.70);

            when(service.getConfiguration()).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/api/v1/config/weights"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.similarityThreshold").value(0.75))
                    .andExpect(jsonPath("$.keywordWeight").value(0.30))
                    .andExpect(jsonPath("$.semanticWeight").value(0.70));

            verify(service).getConfiguration();
            verifyNoMoreInteractions(service);
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/config/weights")
    class UpdateConfiguration {

        @Test
        @DisplayName("should update search configuration")
        void shouldUpdateSearchConfiguration() throws Exception {

            // Arrange
            SearchConfigurationRequest request =new  SearchConfigurationRequest(0.75,0.30,0.70);

            // Act & Assert
            mockMvc.perform(
                            put("/api/v1/config/weights")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request))
                    )
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(200))
                    .andExpect(jsonPath("$.message")
                            .value("Search configuration updated successfully."));

            verify(service).updateConfiguration(any(SearchConfigurationRequest.class));
            verifyNoMoreInteractions(service);
        }

        @Test
        @DisplayName("should return 400 when request is invalid")
        void shouldReturnBadRequestForInvalidRequest() throws Exception {

            // Arrange
            SearchConfigurationRequest request = new SearchConfigurationRequest(2.80,-1.20,0.80);

            // Act & Assert
            mockMvc.perform(
                            put("/api/v1/config/weights")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request))
                    )
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(service);
        }
    }
}