package com.ragflow.dashboard.service;

import com.ragflow.dashboard.client.RetrievalClient;
import com.ragflow.dashboard.dto.response.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HomeServiceTest {

    @Mock
    private RetrievalClient retrievalClient;

    @InjectMocks
    private HomeService homeService;

    private DatasetResponse datasetResponse;
    private ChatResponse chatResponse;

    @BeforeEach
    void setup() {

        datasetResponse = DatasetResponse.builder()
                .id("1")
                .name("dataset")
                .docNum(10)
                .createTime(1777973807647L)
                .build();

        chatResponse = ChatResponse.builder()
                .id("101")
                .name("chat")
                .createTime(1778060237041L)
                .build();
    }

    @Test
    void shouldReturnHomeOverview() {

        when(retrievalClient.getRecentDatasets("tenant1"))
                .thenReturn(List.of(datasetResponse));

        when(retrievalClient.getRecentChats("user1"))
                .thenReturn(List.of(chatResponse));

        HomeOverviewResponse response = homeService.getOverview("tenant1", "user1");

        assertNotNull(response);

        assertEquals(1, response.getDatasets().size());
        assertEquals(1, response.getChats().size());

        assertEquals("dataset",
                response.getDatasets().get(0).getName());

        assertEquals("chat",
                response.getChats().get(0).getName());
    }
}
