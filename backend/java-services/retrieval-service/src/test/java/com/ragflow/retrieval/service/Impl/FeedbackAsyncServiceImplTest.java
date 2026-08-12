package com.ragflow.retrieval.service.Impl;

import com.ragflow.retrieval.entity.SearchFeedback;
import com.ragflow.retrieval.repository.SearchFeedbackRepository;
import com.ragflow.retrieval.service.impl.FeedbackAsyncServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.TransientDataAccessResourceException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackAsyncServiceImplTest {

    @Mock
    private SearchFeedbackRepository searchFeedbackRepository;

    @InjectMocks
    private FeedbackAsyncServiceImpl feedbackAsyncService;

    private SearchFeedback feedback;

    @BeforeEach
    void setUp() {
        feedback = SearchFeedback.builder()
                .queryId("query-123")
                .chunkId("chunk-456")
                .score(1)
                .build();
    }

    @Test
    void saveFeedback_ShouldSaveSuccessfully() {

        when(searchFeedbackRepository.save(feedback)).thenReturn(feedback);

        feedbackAsyncService.saveFeedback(feedback);

        verify(searchFeedbackRepository, times(1)).save(feedback);
    }

    @Test
    void saveFeedback_ShouldThrowException_WhenRepositoryFails() {

        doThrow(new TransientDataAccessResourceException("DB Error"))
                .when(searchFeedbackRepository)
                .save(feedback);

        assertThrows(
                TransientDataAccessResourceException.class,
                () -> feedbackAsyncService.saveFeedback(feedback)
        );

        verify(searchFeedbackRepository).save(feedback);
    }

    @Test
    void recover_ShouldExecuteWithoutException() {

        Exception ex = new RuntimeException("Failure");

        assertDoesNotThrow(() ->
                feedbackAsyncService.recover(ex, feedback)
        );
    }
}
