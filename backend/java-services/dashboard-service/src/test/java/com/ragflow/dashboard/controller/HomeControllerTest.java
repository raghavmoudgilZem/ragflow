package com.ragflow.dashboard.controller;

import com.ragflow.dashboard.dto.response.HomeOverviewResponse;
import com.ragflow.dashboard.service.HomeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HomeController.class)
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HomeService homeService;

    @Test
    void shouldReturnOverview() throws Exception {

        HomeOverviewResponse response = HomeOverviewResponse.builder()
                        .datasets(List.of())
                        .chats(List.of())
                        .quickAccess(List.of("Chat"))
                        .build();

        when(homeService.getOverview("tenant1", "user1"))
                .thenReturn(response);

        mockMvc.perform(get("/home/overview")
                        .param("tenantId", "tenant1")
                        .param("userId", "user1"))
                .andExpect(status().isOk());
    }
}
