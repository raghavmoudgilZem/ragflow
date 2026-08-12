package com.ragflow.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetCardResponse {

    private String id;

    private String name;

    private Integer fileCount;

    private LocalDateTime createdAt;
}