package com.ragflow.document.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

public record DocumentCreateRequest(
        @NotBlank(message = "File name can't be empty.")
        @Length(max = 255, message = "File name must be 255 bytes or less.") // Assuming FILE_NAME_LEN_LIMIT = 255
        String name,

        @NotNull(message = "Lack of 'KB ID'")
        String kbId
) {}