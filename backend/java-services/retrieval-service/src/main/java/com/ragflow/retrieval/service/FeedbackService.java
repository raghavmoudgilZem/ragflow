package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.request.FeedbackRequest;

public interface FeedbackService {
    void submitFeedback(FeedbackRequest request);
}
