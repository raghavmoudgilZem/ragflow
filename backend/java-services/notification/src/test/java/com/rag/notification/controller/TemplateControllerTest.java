package com.rag.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.notification.dto.request.CreateTemplateRequest;
import com.rag.notification.dto.request.CreateTemplateVersionRequest;
import com.rag.notification.dto.request.UpdateTemplateStatusRequest;
import com.rag.notification.dto.response.PagedResponse;
import com.rag.notification.dto.response.TemplatePreviewResponse;
import com.rag.notification.dto.response.TemplateResponse;
import com.rag.notification.exception.GlobalExceptionHandler;
import com.rag.notification.exception.TemplateNotFoundException;
import com.rag.notification.service.TemplateService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TemplateController.class)
@Import(GlobalExceptionHandler.class)
class TemplateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TemplateService templateService;

    @Test
    @DisplayName("POST /api/v1/templates - 201 Created on valid request")
    void create_Returns201() throws Exception {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "Welcome Onboarding", "welcome_v1", "Subject", "Body", true
        );
        TemplateResponse response = new TemplateResponse(
                1L, "Welcome Onboarding", "welcome_v1", "Subject", "Body", 1, true, LocalDateTime.now()
        );

        when(templateService.create(any(CreateTemplateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status_code").value(201))
                .andExpect(jsonPath("$.data.templateId").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/templates - 200 OK with paginated list")
    void list_Returns200_WithPagination() throws Exception {
        TemplateResponse templateResponse = new TemplateResponse(
                1L, "Welcome Onboarding", "welcome_v1", "Subject", "Body", 1, true, LocalDateTime.now()
        );
        PagedResponse<TemplateResponse> pagedResponse = new PagedResponse<>(
                List.of(templateResponse), 0, 10, 1, 1, true
        );

        when(templateService.list(eq(true), eq(0), eq(10), eq("createdAt"), eq("desc")))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/templates?status=true&page=0&size=10&sortBy=createdAt&sortDir=desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].templateSlug").value("welcome_v1"))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/templates/{id} - 200 OK")
    void getById_Returns200() throws Exception {
        TemplateResponse response = new TemplateResponse(
                1L, "Welcome Onboarding", "welcome_v1", "Subject", "Body", 1, true, LocalDateTime.now()
        );

        when(templateService.getById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/templates/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.templateSlug").value("welcome_v1"));
    }

    @Test
    @DisplayName("GET /api/v1/templates/{id} - 404 Not Found")
    void getById_Returns404_WhenNotFound() throws Exception {
        when(templateService.getById(99L)).thenThrow(new TemplateNotFoundException("Template not found with ID: 99"));

        mockMvc.perform(get("/api/v1/templates/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status_code").value(404));
    }

    @Test
    @DisplayName("GET /api/v1/templates/{id}/preview - 200 OK")
    void preview_Returns200() throws Exception {
        TemplatePreviewResponse response = new TemplatePreviewResponse("Welcome Alex!", "Hi Alex");

        when(templateService.preview(eq(1L), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/templates/1/preview?first_name=Alex"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.subject").value("Welcome Alex!"));
    }

    @Test
    @DisplayName("PATCH /api/v1/templates/{id}/status - 200 OK")
    void updateStatus_Returns200() throws Exception {
        UpdateTemplateStatusRequest request = new UpdateTemplateStatusRequest(false);
        TemplateResponse response = new TemplateResponse(
                1L, "Welcome Onboarding", "welcome_v1", "Subject", "Body", 1, false, LocalDateTime.now()
        );

        when(templateService.updateStatus(1L, false)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/templates/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/templates/{id}/version - 201 Created")
    void createNewVersion_Returns201() throws Exception {
        CreateTemplateVersionRequest request = new CreateTemplateVersionRequest("V2 Subject", "V2 Body");
        TemplateResponse response = new TemplateResponse(
                2L, "Welcome Onboarding", "welcome_v1", "V2 Subject", "V2 Body", 2, true, LocalDateTime.now()
        );

        when(templateService.createNewVersion(eq(1L), any(CreateTemplateVersionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/templates/1/version")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.version").value(2));
    }
}