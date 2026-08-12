package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.response.ChatResponse;
import com.ragflow.retrieval.entity.Conversation;
import com.ragflow.retrieval.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository repository;

    public List<ChatResponse> getRecentChats(String userId) {
        return repository.findByUserIdOrderByCreateTimeDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ChatResponse mapToResponse(Conversation c) {
        return ChatResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .createTime(c.getCreateTime())
                .build();
    }
}
