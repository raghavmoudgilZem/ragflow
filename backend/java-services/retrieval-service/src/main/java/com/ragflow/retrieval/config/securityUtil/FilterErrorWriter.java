package com.ragflow.retrieval.config.securityUtil;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;

import java.io.IOException;

public final class FilterErrorWriter {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private FilterErrorWriter() {}

    public static void writeErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        var apiError = ApiError.of(status, message);
        response.getWriter().write(objectMapper.writeValueAsString(apiError));
    }
}