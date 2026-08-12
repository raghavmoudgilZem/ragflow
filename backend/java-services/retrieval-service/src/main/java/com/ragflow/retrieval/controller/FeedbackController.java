package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.constants.ApiConstants;
import com.ragflow.retrieval.dto.request.FeedbackRequest;
import com.ragflow.retrieval.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApiConstants.API_V1+ApiConstants.FEEDBACK_API)
@Tag(name = "Feedback", description = "APIs for capturing user feedback on search results")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @Operation(
            summary = "Submit search feedback",
            description = "Captures thumbs up/down feedback for a search result asynchronously."
    )
    @ApiResponse(responseCode = "200", description = "Feedback accepted successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    public ResponseEntity<Void> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        log.info("Received feedback request. queryId={}, chunkId={}, score={}", request.queryId(), request.chunkId(), request.score());
        feedbackService.submitFeedback(request);
        log.info("Feedback request accepted. queryId={}, chunkId={}", request.queryId(), request.chunkId());
        return ResponseEntity.ok().build();
    }
}