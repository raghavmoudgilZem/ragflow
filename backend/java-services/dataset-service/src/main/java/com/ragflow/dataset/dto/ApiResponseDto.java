package com.ragflow.dataset.dto;

import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@ToString
@Builder
public class ApiResponseDto {

    private int code;
    private String message;
    private Object data;


}
