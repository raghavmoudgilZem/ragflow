package com.ragflow.retrieval.service.Impl;

import com.ragflow.retrieval.dto.request.FeedbackRequest;
import com.ragflow.retrieval.entity.SearchFeedback;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.service.FeedbackAsyncService;
import com.ragflow.retrieval.service.impl.FeedbackServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceImplTest {

    @Mock
    private FeedbackAsyncService feedbackAsyncService;

    @InjectMocks
    private FeedbackServiceImpl feedbackService;

    @Test
    void shouldSubmitFeedbackSuccessfully() {

        FeedbackRequest request =
                new FeedbackRequest("query-123", "chunk-456", 1);

        feedbackService.submitFeedback(request);

        ArgumentCaptor<SearchFeedback> captor =
                ArgumentCaptor.forClass(SearchFeedback.class);

        verify(feedbackAsyncService).saveFeedback(captor.capture());

        SearchFeedback feedback = captor.getValue();

        assertEquals("query-123", feedback.getQueryId());
        assertEquals("chunk-456", feedback.getChunkId());
        assertEquals(1, feedback.getScore());
    }

    @Test
    void shouldThrowExceptionWhenScoreIsNull() {

        FeedbackRequest request =
                new FeedbackRequest("query-123", "chunk-456", null);

        assertThrows(
                BusinessException.class,
                () -> feedbackService.submitFeedback(request)
        );

        verify(feedbackAsyncService, never()).saveFeedback(any());
    }

    @Test
    void shouldThrowExceptionWhenScoreIsGreaterThanOne() {

        FeedbackRequest request =
                new FeedbackRequest("query-123", "chunk-456", 2);

        assertThrows(
                BusinessException.class,
                () -> feedbackService.submitFeedback(request)
        );

        verify(feedbackAsyncService, never()).saveFeedback(any());
    }

    @Test
    void shouldThrowExceptionWhenScoreIsLessThanMinusOne() {

        FeedbackRequest request =
                new FeedbackRequest("query-123", "chunk-456", -2);

        assertThrows(
                BusinessException.class,
                () -> feedbackService.submitFeedback(request)
        );

        verify(feedbackAsyncService, never()).saveFeedback(any());
    }
}
