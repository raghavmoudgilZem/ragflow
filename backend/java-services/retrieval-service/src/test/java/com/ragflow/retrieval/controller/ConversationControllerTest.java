package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.dto.response.ChatResponse;
import com.ragflow.retrieval.service.ConversationService;
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

@WebMvcTest(ConversationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ConversationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ConversationService service;

    @Test
    void shouldReturnChats() throws Exception {

        ChatResponse response = ChatResponse.builder()
                .id("1")
                .name("chat")
                .createTime(1778060237041L)
                .build();

        when(service.getRecentChats("user1"))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/conversations/recent").param("userId", "user1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnEmptyChatList() throws Exception {

        when(service.getRecentChats("user1"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/conversations/recent").param("userId", "user1"))
                .andExpect(status().isOk());
    }
}