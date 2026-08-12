package com.ragflow.retrieval.service.impl;

import com.ragflow.retrieval.dto.request.FeedbackRequest;
import com.ragflow.retrieval.entity.SearchFeedback;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.service.FeedbackAsyncService;
import com.ragflow.retrieval.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackAsyncService feedbackAsyncService;

    @Override
    public void submitFeedback(FeedbackRequest request) {

        log.debug("Validating feedback request. queryId={}, chunkId={}", request.queryId(), request.chunkId());
        validateScore(request.score());
        SearchFeedback feedback = SearchFeedback.builder()
                .queryId(request.queryId())
                .chunkId(request.chunkId())
                .score(request.score())
                .build();
        feedbackAsyncService.saveFeedback(feedback);
        log.debug("Feedback submitted for asynchronous processing. queryId={}, chunkId={}", request.queryId(), request.chunkId());
    }

    private void validateScore(Integer score) {
        if (score == null || (score != 1 && score != 0 && score != -1)) {
            log.error("Invalid feedback score received: {}", score);
            throw new BusinessException(ErrorCode.INVALID_FEEDBACK_SCORE);
        }
    }
}