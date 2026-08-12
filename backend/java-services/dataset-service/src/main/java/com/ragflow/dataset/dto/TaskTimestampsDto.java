package com.ragflow.dataset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Formatted finish-timestamps for the three background tasks tracked on a
 * dataset. Null when the corresponding task hasn't run/finished yet.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTimestampsDto {
    private String graphragTaskFinishAt;
    private String raptorTaskFinishAt;
    private String mindmapTaskFinishAt;
}
