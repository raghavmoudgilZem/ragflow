package com.ragflow.file.dto.request;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record MoveFileRequest(

        @NotEmpty(message = "src_file_ids cannot be empty")
        @JsonProperty("src_file_ids")
        List<UUID> srcFileIds,

        @NotNull(message = "dest_file_id is required")
        @JsonProperty("dest_file_id")
        UUID destFileId

) {
}
