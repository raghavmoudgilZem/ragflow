package com.ragflow.dashboard.service;

import com.ragflow.dashboard.client.RetrievalClient;
import com.ragflow.dashboard.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final RetrievalClient retrievalClient;

    public HomeOverviewResponse getOverview(String tenantId, String userId) {

        // Datasets by tenantId
        List<DatasetResponse> datasets = retrievalClient.getRecentDatasets(tenantId);

        List<DatasetCardResponse> mappedDatasets = datasets.stream()
                .map(this::mapToCard)
                .toList();

        // Chats by userId
        List<ChatCardResponse> chats = getChats(userId);

        // Build combined response
        return HomeOverviewResponse.builder()
                .datasets(mappedDatasets)
                .chats(chats)
                .quickAccess(List.of("Chat", "Search", "Agent", "Memory"))
                .build();
    }

    private DatasetCardResponse mapToCard(DatasetResponse dto) {
        return DatasetCardResponse.builder()
                .id(dto.getId())
                .name(dto.getName())
                .fileCount(dto.getDocNum())
                .createdAt(dto.getCreateTime() == null ? null : LocalDateTime.ofInstant(Instant.ofEpochMilli(dto.getCreateTime()), ZoneId.systemDefault()))
                .build();
    }

    public List<ChatCardResponse> getChats(String tenantId) {
        return retrievalClient.getRecentChats(tenantId)
                .stream()
                .map(this::mapChat)
                .toList();
    }

    private ChatCardResponse mapChat(ChatResponse dto) {
        return ChatCardResponse.builder()
                .id(dto.getId())
                .name(dto.getName())
                .createdAt(dto.getCreateTime() == null ? null : LocalDateTime.ofInstant(Instant.ofEpochMilli(dto.getCreateTime()), ZoneId.systemDefault()))
                .build();
    }
}
