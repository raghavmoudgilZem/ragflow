package com.ragflow.document.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.document.dto.DocumentDto;
import com.ragflow.document.dto.request.ChangeStatusRequest;
import com.ragflow.document.dto.request.DocumentCreateRequest;
import com.ragflow.document.dto.request.DocumentListRequest;
import com.ragflow.document.dto.response.FileDownloadResponse;
import com.ragflow.document.dto.response.FileUploadResponse;
import com.ragflow.document.dto.response.PaginatedResponse;
import com.ragflow.document.model.Document;
import com.ragflow.document.service.DocumentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocumentController.class)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DocumentService documentService;

    private static final String USER_ID = "user-123";

    @Test
    @DisplayName("Should create document successfully")
    void shouldCreateDocument() throws Exception {

        Document document = new Document();

        DocumentCreateRequest request =
                new DocumentCreateRequest("Document Name", "kb-1");

        given(documentService.createDocument(any(DocumentCreateRequest.class), eq(USER_ID))).willReturn(document);

        mockMvc.perform(post("/api/document/v1/create")
                        .header("X-User-Id", USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        then(documentService)
                .should()
                .createDocument(any(DocumentCreateRequest.class), eq(USER_ID));
    }

    @Test
    @DisplayName("Should upload files successfully")
    void shouldUploadFiles() throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "sample.txt",
                        MediaType.TEXT_PLAIN_VALUE,
                        "hello".getBytes());

        FileUploadResponse response = new FileUploadResponse(List.of(), List.of());

        given(documentService.processFileUpload(
                eq("kb-1"),
                anyList(),
                eq(USER_ID)))
                .willReturn(response);

        mockMvc.perform(multipart("/api/document/v1/upload")
                        .file(file)
                        .param("kb_id", "kb-1")
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk());

        then(documentService)
                .should()
                .processFileUpload(eq("kb-1"), anyList(), eq(USER_ID));
    }

    @Test
    void shouldReturnBadRequestWhenFileMissing() throws Exception {

        MockMultipartFile empty =
                new MockMultipartFile(
                        "file",
                        "",
                        MediaType.TEXT_PLAIN_VALUE,
                        new byte[0]);

        mockMvc.perform(multipart("/api/document/v1/upload")
                        .file(empty)
                        .param("kb_id", "kb-1")
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isBadRequest());

        then(documentService)
                .shouldHaveNoInteractions();
    }

    @Test
    void shouldListDocuments() throws Exception {

        PaginatedResponse<DocumentDto> response =
                new PaginatedResponse<>(
                        1,
                        10,
                        0,
                        0,
                        List.of());

        given(documentService.listDocuments(
                anyString(),
                anyString(),
                anyLong(),
                anyLong(),
                any(DocumentListRequest.class),
                anyString(),
                any()))
                .willReturn(response);

        mockMvc.perform(post("/api/document/v1/list")
                        .header("X-User-Id", USER_ID)
                        .param("kb_id", "kb-1"))
                .andExpect(status().isOk());

        then(documentService)
                .should()
                .listDocuments(
                        anyString(),
                        anyString(),
                        anyLong(),
                        anyLong(),
                        any(DocumentListRequest.class),
                        anyString(),
                        any());
    }

    @Test
    void shouldChangeStatusSuccessfully() throws Exception {

        ChangeStatusRequest request =
                new ChangeStatusRequest(
                        List.of("doc1"),
                        1);

        Map<String, Map<String, String>> result =
                Map.of(
                        "doc1",
                        Map.of("status", "SUCCESS"));

        given(documentService.changeDocumentStatus(
                anyList(),
                anyInt(),
                anyString()))
                .willReturn(result);

        mockMvc.perform(post("/api/document/v1/change_status")
                        .header("X-User-Id", USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        then(documentService)
                .should()
                .changeDocumentStatus(anyList(), anyInt(), anyString());
    }

    @Test
    void shouldReturnPartialContentWhenSomeDocumentsFail() throws Exception {

        ChangeStatusRequest request =
                new ChangeStatusRequest(
                        List.of("doc1"),
                        0);

        Map<String, Map<String, String>> result =
                Map.of(
                        "doc1",
                        Map.of("error", "Already processing"));

        given(documentService.changeDocumentStatus(
                anyList(),
                anyInt(),
                anyString()))
                .willReturn(result);

        mockMvc.perform(post("/api/document/v1/change_status")
                        .header("X-User-Id", USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isPartialContent());
    }

    @Test
    void shouldRemoveDocument() throws Exception {

        given(documentService.removeDocument(anyList(), anyString()))
                .willReturn(null);

        mockMvc.perform(delete("/api/document/v1/remove")
                        .header("X-User-Id", USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of("doc1"))))
                .andExpect(status().isOk());

        then(documentService)
                .should()
                .removeDocument(anyList(), anyString());
    }

    @Test
    void shouldReturnBadRequestWhenDeleteFails() throws Exception {

        given(documentService.removeDocument(anyList(), anyString()))
                .willReturn("Document not found");

        mockMvc.perform(delete("/api/document/v1/remove")
                        .header("X-User-Id", USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of("doc1"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDownloadDocument() throws Exception {

        byte[] content = "hello".getBytes(StandardCharsets.UTF_8);

        FileDownloadResponse response =
                new FileDownloadResponse(
                        new ByteArrayInputStream(content),
                        content.length,
                        MediaType.APPLICATION_PDF_VALUE,
                        "sample.pdf");

        given(documentService.downloadDocument("doc1"))
                .willReturn(response);

        mockMvc.perform(get("/api/document/v1/get/doc1"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string(
                        HttpHeaders.CONTENT_DISPOSITION,
                        containsString("sample.pdf")));

        then(documentService)
                .should()
                .downloadDocument("doc1");
    }
}