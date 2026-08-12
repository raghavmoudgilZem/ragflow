package com.ragflow.retrieval.service;

import com.ragflow.retrieval.entity.SearchFeedback;

public interface FeedbackAsyncService {
    void saveFeedback(SearchFeedback feedback);
}
