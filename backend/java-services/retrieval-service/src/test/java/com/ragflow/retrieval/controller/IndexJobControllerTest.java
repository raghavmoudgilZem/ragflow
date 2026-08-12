package com.ragflow.retrieval.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.retrieval.dto.request.ParsedContentRef;
import com.ragflow.retrieval.dto.request.SubmitIndexJobRequest;
import com.ragflow.retrieval.entity.IndexJob;
import com.ragflow.retrieval.enums.JobPriority;
import com.ragflow.retrieval.enums.JobStatus;
import com.ragflow.retrieval.exception.EmbeddingModelMismatchException;
import com.ragflow.retrieval.exception.EmbeddingServiceException;
import com.ragflow.retrieval.exception.JobAlreadyRunningException;
import com.ragflow.retrieval.exception.ParsedContentUnreadableException;
import com.ragflow.retrieval.exception.UnknownEmbeddingModelException;
import com.ragflow.retrieval.service.IndexJobService;

/**
 * The submit endpoint's contract: 202 with a job handle on acceptance, and the
 * status each rejection maps to. The service is stubbed — what is under test is
 * the HTTP surface (status codes, request validation, response shape), not the
 * submission rules themselves, which {@code IndexJobServiceTest} covers.
 *
 * <p>202 rather than 201 is deliberate: the work has been queued, not done.
 */
@WebMvcTest(IndexJobController.class)
@AutoConfigureMockMvc(addFilters = false)
class IndexJobControllerTest {

    private static final String URL = "/api/v1/kb/kb-1/index-jobs";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IndexJobService indexJobService;

    // ---------------------------------------------------------------- helpers

    private static SubmitIndexJobRequest.SubmitIndexJobRequestBuilder requestBuilder() {
        return SubmitIndexJobRequest.builder()
                .docId("doc-1")
                .tenantId("tenant-1")
                .docName("handbook.pdf")
                .parsedContentRef(new ParsedContentRef("MINIO", "parsed", "tenant-1/doc-1.txt"))
                .parserId("naive")
                .parserConfig(Map.of("chunkTokenSize", 256))
                .embeddingModelId("gemini-embedding-001")
                .priority(JobPriority.NORMAL);
    }

    private static SubmitIndexJobRequest validRequest() {
        return requestBuilder().build();
    }

    private static IndexJob queuedJob() {
        return IndexJob.builder()
                .jobId(42L)
                .kbId("kb-1")
                .docId("doc-1")
                .status(JobStatus.QUEUED)
                .submittedAt(Instant.parse("2026-07-30T10:15:30Z"))
                .build();
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    // ------------------------------------------------------------- happy path

    @Test
    void submit_returns202WithJobHandle() throws Exception {
        when(indexJobService.submitIndexJob(eq("kb-1"), any())).thenReturn(queuedJob());

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(validRequest())))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.jobId").value(42))
                .andExpect(jsonPath("$.kbId").value("kb-1"))
                .andExpect(jsonPath("$.docId").value("doc-1"))
                .andExpect(jsonPath("$.status").value("QUEUED"))
                .andExpect(jsonPath("$.submittedAt").exists());
    }

    @Test
    void submit_passesPathKbIdAndBodyThrough() throws Exception {
        when(indexJobService.submitIndexJob(any(), any())).thenReturn(queuedJob());

        mockMvc.perform(post("/api/v1/kb/other-kb/index-jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(validRequest())))
                .andExpect(status().isAccepted());

        // kbId comes from the path, everything else from the body.
        ArgumentCaptor<SubmitIndexJobRequest> captor = ArgumentCaptor.forClass(SubmitIndexJobRequest.class);
        verify(indexJobService).submitIndexJob(eq("other-kb"), captor.capture());
        assertThat(captor.getValue().docId()).isEqualTo("doc-1");
        assertThat(captor.getValue().embeddingModelId()).isEqualTo("gemini-embedding-001");
        assertThat(captor.getValue().parsedContentRef().bucket()).isEqualTo("parsed");
    }

    // --------------------------------------------------------- 400 validation

    @Test
    void submit_rejectsMissingDocId() throws Exception {
        SubmitIndexJobRequest request = requestBuilder().docId(null).build();

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("docId is required"));

        verify(indexJobService, never()).submitIndexJob(any(), any());
    }

    @Test
    void submit_rejectsBlankTenantId() throws Exception {
        SubmitIndexJobRequest request = requestBuilder().tenantId("   ").build();

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("tenantId is required"));
    }

    @Test
    void submit_rejectsMissingEmbeddingModelId() throws Exception {
        SubmitIndexJobRequest request = requestBuilder().embeddingModelId(null).build();

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("embeddingModelId is required"));
    }

    @Test
    void submit_rejectsMissingParsedContentRef() throws Exception {
        SubmitIndexJobRequest request = requestBuilder().parsedContentRef(null).build();

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("parsedContentRef is required"));

        verify(indexJobService, never()).submitIndexJob(any(), any());
    }

    @Test
    void submit_rejectsIncompleteParsedContentRef() throws Exception {
        // @Valid cascades into the nested ref: a ref without an object key is
        // useless to the worker and must not reach the service.
        SubmitIndexJobRequest request = requestBuilder()
                .parsedContentRef(new ParsedContentRef("MINIO", "parsed", ""))
                .build();

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("parsedContentRef.objectKey is required"));

        verify(indexJobService, never()).submitIndexJob(any(), any());
    }

    @Test
    void submit_rejectsMalformedJson() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"docId\": "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed JSON request."));
    }

    @Test
    void submit_rejectsUnknownPriorityValue() throws Exception {
        String body = json(validRequest()).replace("\"NORMAL\"", "\"URGENT\"");

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());

        verify(indexJobService, never()).submitIndexJob(any(), any());
    }

    // ---------------------------------------------------------- error mapping

    @Test
    void submit_maps409WhenAJobIsAlreadyRunningForTheDoc() throws Exception {
        when(indexJobService.submitIndexJob(any(), any()))
                .thenThrow(new JobAlreadyRunningException("doc-1", 99L));

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(validRequest())))
                .andExpect(status().isConflict());
    }

    @Test
    void submit_maps400ForAnUnknownEmbeddingModel() throws Exception {
        when(indexJobService.submitIndexJob(any(), any()))
                .thenThrow(new UnknownEmbeddingModelException("no-such-model"));

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(validRequest())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submit_maps400WhenTheKbIsPinnedToADifferentEmbeddingModel() throws Exception {
        when(indexJobService.submitIndexJob(any(), any()))
                .thenThrow(new EmbeddingModelMismatchException("kb-1", "text-embedding-3-small",
                        "gemini-embedding-001"));

        // Shares UNKNOWN_EMBEDDING_MODEL's error code, so it answers 400 —
        // arguably a 409 (conflict with existing state), but pinned as-is.
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(validRequest())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submit_maps422ForUnreadableParsedContent() throws Exception {
        when(indexJobService.submitIndexJob(any(), any()))
                .thenThrow(new ParsedContentUnreadableException("MINIO", "parsed", "tenant-1/doc-1.txt"));

        // 422 rather than 400: the request is well-formed, the referenced
        // object is simply not readable.
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(validRequest())))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void submit_maps500WhenTheEmbeddingServiceAnswersIncompletely() throws Exception {
        when(indexJobService.submitIndexJob(any(), any()))
                .thenThrow(new EmbeddingServiceException("Embedding service reported no vector dimension"));

        // An upstream service that cannot describe its own model is not the
        // caller's fault, so this is a 500 rather than a 4xx.
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(validRequest())))
                .andExpect(status().isInternalServerError());
    }
}
