package com.ragflow.document.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record PaginatedResponse<T>(
        int currentPage,
        int pageSize,
        int totalPages,
        long totalRecords,
        List<T> data
) {

    // Generic Helper method to automatically extract metadata
    public static <T, E> PaginatedResponse<T> of(List<T> data, Page<E> page) {
        return new PaginatedResponse<>(
                page.getNumber() + 1, // 1-indexed for the frontend
                page.getSize(),
                page.getTotalPages(),
                page.getTotalElements(),
                data);
    }
}
