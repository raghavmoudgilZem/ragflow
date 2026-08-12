package com.ragflow.retrieval.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.retrieval.config.securityUtil.ApiError;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiErrorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void apiError_SerializationContract_MatchesExactly() throws Exception {
        int status = 401;
        String message = "Token expired";

        var error = ApiError.of(status, message);
        String jsonResult = objectMapper.writeValueAsString(error);

        // Asserts the exact field presence and naming requirements of the JSON contract
        assertTrue(jsonResult.contains("\"code\":401"));
        assertTrue(jsonResult.contains("\"message\":\"Token expired\""));
        assertTrue(jsonResult.contains("\"timestamp\":"));
    }
}