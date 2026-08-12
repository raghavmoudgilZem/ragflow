package com.ragflow.dataset.dto;

import com.ragflow.dataset.enums.ChunkMethod;
import com.ragflow.dataset.enums.ParseType;
import com.ragflow.dataset.enums.Permission;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDatasetRequestDto {

    @Size(max = 128, message = "Name must be at most 128 characters")
    private String name;
    private String avatar;
    private String description;

    /** Dropdown value from the modal -- validated against EmbeddingModelService. */
    private String embeddingModel;

    @Builder.Default
    private Permission permission = Permission.ME;

    @Builder.Default
    private ParseType parseType = ParseType.BUILT_IN;

    /** Required when parseType == BUILT_IN. */
    private ChunkMethod chunkMethod;

    /** Required when parseType == PIPELINE. */
    private String pipeline;
}
