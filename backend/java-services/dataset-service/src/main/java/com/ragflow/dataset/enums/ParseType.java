package com.ragflow.dataset.enums;

/**
 * Parse Type radio selection in the Create Dataset modal.
 * BUILT_IN  -> requires chunkMethod, parserId is populated, pipelineId is null.
 * PIPELINE  -> requires pipelineId (future enhancement), parserId is null.
 */
public enum ParseType {
    BUILT_IN,
    PIPELINE
}