package com.ragflow.retrieval.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

 @Getter
 @Setter
public class SearchAppCreateRequest {

    @NotBlank(message = "name must not be blank")
    @Size(max = 128, message = "name must not exceed 128 characters")
    private String name;
}
