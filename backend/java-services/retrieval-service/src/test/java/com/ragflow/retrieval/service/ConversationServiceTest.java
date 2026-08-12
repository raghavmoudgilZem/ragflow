package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.response.ChatResponse;
import com.ragflow.retrieval.entity.Conversation;
import com.ragflow.retrieval.repository.ConversationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationRepository repository;

    @InjectMocks
    private ConversationService service;

    @Test
    void shouldReturnChats() {

        Conversation conversation = new Conversation();
        conversation.setId("101");
        conversation.setName("chat-test");
        conversation.setCreateTime(1778060237041L);

        when(repository.findByUserIdOrderByCreateTimeDesc("user1"))
                .thenReturn(List.of(conversation));

        List<ChatResponse> result = service.getRecentChats("user1");

        assertEquals(1, result.size());
        assertEquals("chat-test", result.get(0).getName());
    }

    @Test
    void shouldReturnEmptyChats() {

        when(repository.findByUserIdOrderByCreateTimeDesc("user1"))
                .thenReturn(List.of());

        List<ChatResponse> result = service.getRecentChats("user1");

        assertEquals(0, result.size());
    }
}