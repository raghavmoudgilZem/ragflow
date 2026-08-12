package com.ragflow.file.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record FileListResponse(
        Long total,
        List<FileResponse> files,
        ParentFolderResponse parentFolder
) {
    // Compact constructor to ensure 'files' is never null
    public FileListResponse {
        files = files != null ? files : List.of();
        total = total != null ? total : 0L;
    }
}