package com.ragflow.document.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ParserConfig implements Serializable {

    // Default value: [[1, 1000000]]
    private List<List<Integer>> pages = List.of(List.of(1, 1000000));

    // Default value: 0
    @JsonProperty("table_context_size")
    private int tableContextSize = 0;

    // Default value: 0
    @JsonProperty("image_context_size")
    private int imageContextSize = 0;
}
