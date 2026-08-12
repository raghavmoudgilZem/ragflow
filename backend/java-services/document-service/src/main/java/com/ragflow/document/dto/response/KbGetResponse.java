package com.ragflow.document.dto.response;

import com.ragflow.document.dto.KnowledgebaseDto;

public record KbGetResponse(
        String error,
        KnowledgebaseDto kb
) {}
