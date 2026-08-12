package com.ragflow.dashboard.controller;

import com.ragflow.dashboard.dto.response.HomeOverviewResponse;
import com.ragflow.dashboard.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/home/overview")
    public HomeOverviewResponse getOverview(@RequestParam String tenantId, @RequestParam String userId) {
        return homeService.getOverview(tenantId, userId);
    }
}
