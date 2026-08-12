package com.ragflow.file.dto.request;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public record UploadRequest(

//        @JsonProperty("parent_id")
        UUID parent_id,

        @NotNull(message = "file list cannot be null")
        List<MultipartFile> file

) {
}
