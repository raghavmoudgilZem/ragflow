package com.ragflow.file.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KbInfo {

    @JsonProperty("document_id")
    private String documentId;

    @JsonProperty("kb_id")
    private String kbId;

    @JsonProperty("kb_name")
    private String kbName;

}
