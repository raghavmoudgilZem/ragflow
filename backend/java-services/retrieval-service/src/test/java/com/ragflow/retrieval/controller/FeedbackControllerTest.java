package com.ragflow.retrieval.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.retrieval.dto.request.FeedbackRequest;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.service.FeedbackService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FeedbackController.class)
@AutoConfigureMockMvc(addFilters = false)
class FeedbackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FeedbackService feedbackService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void submitFeedback_ShouldReturnOk() throws Exception {

        FeedbackRequest request =
                new FeedbackRequest("query-123", "chunk-123", 1);

        doNothing().when(feedbackService).submitFeedback(any());

        mockMvc.perform(post("/api/v1/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(feedbackService).submitFeedback(any(FeedbackRequest.class));
    }
    @Test
    void submitFeedback_ShouldReturnBadRequest_WhenQueryIdMissing() throws Exception {

        FeedbackRequest request =
                new FeedbackRequest("", "chunk-123", 1);

        mockMvc.perform(post("/api/v1/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
    @Test
    void submitFeedback_ShouldReturnBadRequest_WhenBusinessExceptionOccurs() throws Exception {

        FeedbackRequest request =
                new FeedbackRequest("query-123", "chunk-123", 5);

        doThrow(new BusinessException(ErrorCode.INVALID_FEEDBACK_SCORE))
                .when(feedbackService)
                .submitFeedback(any());

        mockMvc.perform(post("/api/v1/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}