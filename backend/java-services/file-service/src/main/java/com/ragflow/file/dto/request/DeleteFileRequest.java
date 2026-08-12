package com.ragflow.file.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record DeleteFileRequest(

        @NotNull(message = "file_ids cannot be null")
        @NotEmpty(message = "file_ids list cannot be empty")
        @Size(min = 1, message = "At least one file ID must be provided")
        @JsonProperty("file_ids")
        List<UUID> fileIds,

        @JsonProperty("parent_id")
        UUID parentId

) {}
