package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.dto.response.ChatResponse;
import com.ragflow.retrieval.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService service;

    @GetMapping("/recent")
    public List<ChatResponse> getRecentChats(@RequestParam String userId) {
        return service.getRecentChats(userId);
    }
}
