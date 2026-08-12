package com.ragflow.file.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RenameFileRequest(

        @NotNull(message = "file_id is required")
        @JsonProperty("file_id")
        UUID fileId,

        @NotBlank(message = "name is required")
        String name

) {}
