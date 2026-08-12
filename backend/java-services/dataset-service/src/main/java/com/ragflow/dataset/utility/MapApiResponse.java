package com.ragflow.dataset.utility;


import com.ragflow.dataset.dto.ApiResponseDto;

public class MapApiResponse {

    private MapApiResponse(){}

    public static ApiResponseDto mapToApiResponse(String message, Integer status, Object ob){
        return ApiResponseDto.builder()
                .message(message)
                .code(status)
                .data(ob)
                .build();

    }


}
