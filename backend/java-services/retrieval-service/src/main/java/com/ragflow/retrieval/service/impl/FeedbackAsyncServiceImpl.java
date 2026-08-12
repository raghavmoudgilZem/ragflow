package com.ragflow.retrieval.service.impl;

import com.ragflow.retrieval.entity.SearchFeedback;
import com.ragflow.retrieval.repository.SearchFeedbackRepository;
import com.ragflow.retrieval.service.FeedbackAsyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackAsyncServiceImpl implements FeedbackAsyncService {
    private final SearchFeedbackRepository searchFeedbackRepository;

    @Async("feedbackTaskExecutor")
    @Retryable(
            retryFor = {TransientDataAccessException.class, CannotAcquireLockException.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 500, multiplier = 2)
    )
    @Override
    public void saveFeedback(SearchFeedback feedback) {
        searchFeedbackRepository.save(feedback);
        log.debug("Feedback saved successfully. queryId={}, chunkId={}", feedback.getQueryId(), feedback.getChunkId());
    }

    @Recover
    public void recover(Exception ex, SearchFeedback feedback) {
        log.error("Failed to persist feedback after retries. queryId={}, chunkId={}", feedback.getQueryId(), feedback.getChunkId(), ex);
    }
}
