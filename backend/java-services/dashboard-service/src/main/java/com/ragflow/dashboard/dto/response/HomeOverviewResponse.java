package com.ragflow.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeOverviewResponse {

    private List<DatasetCardResponse> datasets;

    private List<ChatCardResponse> chats;

    private List<String> quickAccess;
}
