package com.ragflow.dashboard.client;

import com.ragflow.dashboard.dto.response.ChatResponse;
import com.ragflow.dashboard.dto.response.DatasetResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "retrieval-service", url = "${retrieval.service.url}")
public interface RetrievalClient {

    @GetMapping("/api/v1/datasets/recent")
    List<DatasetResponse> getRecentDatasets(@RequestParam String tenantId);

    @GetMapping("/api/v1/conversations/recent")
    List<ChatResponse> getRecentChats(@RequestParam String userId);
}
