package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.dto.response.DatasetResponse;
import com.ragflow.retrieval.service.DatasetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DatasetController.class)
@AutoConfigureMockMvc(addFilters = false)
class DatasetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DatasetService service;

    @Test
    void shouldReturnDatasets() throws Exception {

        DatasetResponse response = DatasetResponse.builder()
                .id("1")
                .name("dataset")
                .docNum(10)
                .chunkNum(20)
                .tokenNum(100)
                .createTime(1777973807647L)
                .build();

        when(service.getRecentDatasets("tenant1"))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/datasets/recent").param("tenantId", "tenant1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnEmptyDatasetList() throws Exception {

        when(service.getRecentDatasets("tenant1"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/datasets/recent").param("tenantId", "tenant1"))
                .andExpect(status().isOk());
    }
}