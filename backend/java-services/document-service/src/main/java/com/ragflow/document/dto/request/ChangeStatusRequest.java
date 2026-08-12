package com.ragflow.document.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ChangeStatusRequest(
        @NotNull(message = "doc_ids cannot be null")
        List<String> docIds,

        @Min(value = 0, message = "\"Status\" must be either 0 or 1!")
        @Max(value = 1, message = "\"Status\" must be either 0 or 1!")
        int status
) {}