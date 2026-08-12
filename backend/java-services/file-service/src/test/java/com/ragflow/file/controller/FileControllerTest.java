package com.ragflow.file.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.file.dto.request.*;
import com.ragflow.file.dto.response.FileListResponse;
import com.ragflow.file.dto.response.FileResponse;
import com.ragflow.file.dto.response.ParentFolderResponse;
import com.ragflow.file.dto.response.UploadFileResponse;
import com.ragflow.file.service.FileService;
import com.ragflow.file.utils.CommonConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FileController.class)
class FileControllerTest {

    private static final String BASE_PATH = "/" + CommonConstants.BASE_URL;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FileService fileService;

    private UUID tenantId;
    private UUID userId;
    private UUID fileId;
    private UUID parentId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        userId = UUID.randomUUID();
        fileId = UUID.randomUUID();
        parentId = UUID.randomUUID();
    }

    // =========================================================================
    // POST /create
    // =========================================================================

    @Nested
    @DisplayName("POST /create Tests")
    class CreateFolderTests {

        @Test
        @DisplayName("Should create folder successfully and return 200 OK")
        void create_WhenValidRequest_ShouldReturnOk() throws Exception {
            FileResponse fileResponse = FileResponse.builder()
                    .id(fileId)
                    .parentId(parentId)
                    .tenantId(tenantId)
                    .createdBy(tenantId)
                    .name("NewFolder")
                    .type("FOLDER")
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            when(fileService.create(any(CreateFolderRequest.class))).thenReturn(fileResponse);

            // Note: Use parent_id if CreateFolderRequest uses snake_case record component
            String jsonPayload = """
            {
                "name": "NewFolder",
                "parent_id": "%s",
                "type": "FOLDER"
            }
            """.formatted(parentId);

            mockMvc.perform(post(BASE_PATH + "/create")
                            .header("X-Tenant-Id", tenantId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonPayload))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(fileId.toString()))
                    .andExpect(jsonPath("$.data.name").value("NewFolder"));

            verify(fileService, times(1)).create(any(CreateFolderRequest.class));
        }
    }

    // =========================================================================
    // POST /upload
    // =========================================================================

    @Nested
    @DisplayName("POST /upload Tests")
    class UploadFileTests {

        @Test
        @DisplayName("Should upload files successfully and return list of UploadFileResponse")
        void upload_WhenValidMultipartFile_ShouldReturnOk() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file", "document.pdf", MediaType.APPLICATION_PDF_VALUE, "PDF content".getBytes()
            );

            UploadFileResponse uploadResponse = UploadFileResponse.builder()
                    .id(fileId)
                    .parentId(parentId)
                    .tenantId(tenantId)
                    .createdBy(tenantId)
                    .name("document.pdf")
                    .location("document.pdf")
                    .size(11L)
                    .type("pdf")
                    .build();

            when(fileService.uploadFiles(any(UploadRequest.class)))
                    .thenReturn(List.of(uploadResponse));

            mockMvc.perform(multipart(BASE_PATH + "/upload")
                            .file(file)
                            .param("parent_id", parentId.toString())
                            .header("X-Tenant-Id", tenantId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status_code").value(200))
                    .andExpect(jsonPath("$.data[0].id").value(fileId.toString()))
                    .andExpect(jsonPath("$.data[0].name").value("document.pdf"));

            verify(fileService, times(1)).uploadFiles(any(UploadRequest.class));
        }
    }

    // =========================================================================
    // POST /remove
    // =========================================================================

    @Nested
    @DisplayName("POST /remove Tests")
    class DeleteFilesTests {

        @Test
        @DisplayName("Should delete files and return true")
        void deleteFiles_WhenValidRequest_ShouldReturnTrue() throws Exception {
            DeleteFileRequest request = new DeleteFileRequest(List.of(fileId), parentId);

            doNothing().when(fileService).deleteFiles(anyList());

            mockMvc.perform(post(BASE_PATH + "/remove")
                            .header("X-Tenant-Id", tenantId.toString()) // Include tenant header if required by interceptor
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andDo(print()) // Console output for verification
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status_code").value(200))
                    .andExpect(jsonPath("$.data").value(true));

            verify(fileService, times(1)).deleteFiles(anyList());
        }
    }

    // =========================================================================
    // POST /rename
    // =========================================================================

    @Nested
    @DisplayName("POST /rename Tests")
    class RenameFileTests {

        @Test
        @DisplayName("Should rename file and return true")
        void renameFile_WhenValidRequest_ShouldReturnTrue() throws Exception {
            RenameFileRequest request = new RenameFileRequest(fileId, "renamed.txt");

            doNothing().when(fileService).rename(any(UUID.class), anyString());

            mockMvc.perform(post(BASE_PATH + "/rename")
                            .header("X-Tenant-Id", tenantId.toString()) // Ensure tenant context is set if needed by interceptors
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andDo(print()) // Debug output
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status_code").value(200))
                    .andExpect(jsonPath("$.data").value(true));

            verify(fileService, times(1)).rename(any(UUID.class), anyString());
        }
    }

    // =========================================================================
    // POST /move
    // =========================================================================

    @Nested
    @DisplayName("POST /move Tests")
    class MoveFileTests {

        @Test
        @DisplayName("Should rename file and return true")
        void renameFile_WhenValidRequest_ShouldReturnTrue() throws Exception {
            doNothing().when(fileService).rename(any(UUID.class), anyString());

            String jsonPayload = """
    {
        "fileId": "%s",
        "file_id": "%s",
        "name": "renamed.txt"
    }
    """.formatted(fileId, fileId);

            mockMvc.perform(post(BASE_PATH + "/rename")
                            .header("X-Tenant-Id", tenantId.toString())
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonPayload))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status_code").value(200))
                    .andExpect(jsonPath("$.data").value(true));

            verify(fileService, times(1)).rename(eq(fileId), eq("renamed.txt"));
        }
    }

    // =========================================================================
    // GET /get/{id}
    // =========================================================================

    @Nested
    @DisplayName("GET /get/{id} Tests")
    class DownloadFileTests {

        @Test
        @DisplayName("Should download file resource successfully")
        void download_WhenFileExists_ShouldReturnResource() throws Exception {
            byte[] fileContent = "File Download Data".getBytes();
            Resource resource = new ByteArrayResource(fileContent);

            ResponseEntity<Resource> downloadResponse = ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"file.txt\"")
                    .body(resource);

            when(fileService.download(fileId)).thenReturn(downloadResponse);

            mockMvc.perform(get(BASE_PATH + "/get/{id}", fileId)
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk());

            verify(fileService, times(1)).download(fileId);
        }
    }

    // =========================================================================
    // GET /list
    // =========================================================================

    @Nested
    @DisplayName("GET /list Tests")
    class ListFilesTests {

        @Test
        void listFiles_WhenDefaultParams_ShouldReturnFileListResponse() throws Exception {
            FileListResponse response = FileListResponse.builder()
                    .total(1L)
                    .files(List.of(FileResponse.builder().id(fileId).name("item.txt").build()))
                    .build();

            when(fileService.listFiles(any(), any(), any(), any(), any(), any()))
                    .thenReturn(response);

            // Run this performance and look at your IDE Console output
            mockMvc.perform(get(BASE_PATH + "/list")
                            .header("X-Tenant-Id", tenantId.toString()))
                    .andDo(print());
        }

        @Test
        @DisplayName("Should return file list response when custom search and pagination parameters provided")
        void listFiles_WhenCustomParams_ShouldReturnFileListResponse() throws Exception {
            FileListResponse response = FileListResponse.builder()
                    .total(1L)
                    .files(List.of(FileResponse.builder().id(fileId).name("searched.txt").build()))
                    .build();

            when(fileService.listFiles(
                    any(UUID.class),
                    anyString(),
                    anyInt(),
                    anyInt(),
                    anyString(),
                    anyBoolean()
            )).thenReturn(response);

            mockMvc.perform(get(BASE_PATH + "/list")
                            .param("parent_id", parentId.toString())
                            .param("keywords", "searched")
                            .param("page", "2")
                            .param("pageSize", "20")
                            .param("orderBy", "name")
                            .param("desc", "false")
                            .header("X-Tenant-Id", tenantId.toString()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.total").value(1))                  // Target inside data
                    .andExpect(jsonPath("$.data.files[0].name").value("searched.txt"));

            verify(fileService, times(1)).listFiles(
                    any(UUID.class), anyString(), anyInt(), anyInt(), anyString(), anyBoolean()
            );
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when page is less than 1")
        void listFiles_WhenPageLessThanOne_ShouldThrowIllegalArgumentException() throws Exception {
            mockMvc.perform(get(BASE_PATH + "/list")
                            .param("page", "0")
                            .header("X-Tenant-Id", tenantId.toString()))
                    .andExpect(status().isInternalServerError())
                    .andExpect(result -> assertThat(result.getResolvedException())
                            .isInstanceOf(IllegalArgumentException.class)
                            .hasMessage("page must be greater than 0"));

            verifyNoInteractions(fileService);
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when pageSize is less than 1")
        void listFiles_WhenPageSizeLessThanOne_ShouldThrowIllegalArgumentException() throws Exception {
            mockMvc.perform(get(BASE_PATH + "/list")
                            .param("pageSize", "0")
                            .header("X-Tenant-Id", tenantId.toString()))
                    .andExpect(status().isInternalServerError())
                    .andExpect(result -> assertThat(result.getResolvedException())
                            .isInstanceOf(IllegalArgumentException.class)
                            .hasMessage("page_size must be between 1 and 500"));

            verifyNoInteractions(fileService);
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when pageSize is greater than 500")
        void listFiles_WhenPageSizeGreaterThan500_ShouldThrowIllegalArgumentException() throws Exception {
            mockMvc.perform(get(BASE_PATH + "/list")
                            .param("pageSize", "501")
                            .header("X-Tenant-Id", tenantId.toString()))
                    .andExpect(status().isInternalServerError())
                    .andExpect(result -> assertThat(result.getResolvedException())
                            .isInstanceOf(IllegalArgumentException.class)
                            .hasMessage("page_size must be between 1 and 500"));

            verifyNoInteractions(fileService);
        }
    }
}