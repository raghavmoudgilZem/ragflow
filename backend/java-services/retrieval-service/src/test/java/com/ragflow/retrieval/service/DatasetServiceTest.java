package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.response.DatasetResponse;
import com.ragflow.retrieval.entity.Dataset;
import com.ragflow.retrieval.repository.KnowledgebaseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DatasetServiceTest {

    @Mock
    private KnowledgebaseRepository repository;

    @InjectMocks
    private DatasetService service;

    @Test
    void shouldReturnDatasets() {

        DatasetResponse dataset = DatasetResponse.builder()
                .id("1")
                .name("dataset")
                .docNum(10)
                .chunkNum(20)
                .tokenNum(100)
                .createTime(1777973807647L)
                .build();

        when(repository.findRecentByTenant("tenant1"))
                .thenReturn(List.of(dataset));

        List<DatasetResponse> result = service.getRecentDatasets("tenant1");

        assertEquals(1, result.size());
        assertEquals("dataset", result.get(0).getName());
        assertEquals(10, result.get(0).getDocNum());
    }

    @Test
    void shouldReturnAllDatasetsWhenTenantIdIsNull() {

        Dataset dataset = new Dataset();
        dataset.setId("1");
        dataset.setName("dataset");
        dataset.setDocNum(10);
        dataset.setChunkNum(20);
        dataset.setTokenNum(100);

        when(repository.findAll())
                .thenReturn(List.of(dataset));

        List<DatasetResponse> result = service.getRecentDatasets(null);

        assertEquals(1, result.size());
        assertEquals("dataset", result.get(0).getName());
    }

    @Test
    void shouldReturnAllDatasetsWhenTenantIdIsBlank() {

        Dataset dataset = new Dataset();
        dataset.setId("1");
        dataset.setName("dataset");

        when(repository.findAll())
                .thenReturn(List.of(dataset));

        List<DatasetResponse> result = service.getRecentDatasets("");

        assertEquals(1, result.size());
    }

    @Test
    void shouldReturnEmptyDatasets() {

        when(repository.findRecentByTenant("tenant1"))
                .thenReturn(List.of());

        List<DatasetResponse> result = service.getRecentDatasets("tenant1");

        assertEquals(0, result.size());
    }
}