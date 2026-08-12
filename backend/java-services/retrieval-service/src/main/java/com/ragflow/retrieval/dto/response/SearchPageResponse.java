package com.ragflow.retrieval.dto.response;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SearchPageResponse<T> {

    private List<T> items;
    private long totalItems;

    public static <T> SearchPageResponse<T> of(List<T> items, long totalItems) {
        return new SearchPageResponse<>(items, totalItems);
    }
}
