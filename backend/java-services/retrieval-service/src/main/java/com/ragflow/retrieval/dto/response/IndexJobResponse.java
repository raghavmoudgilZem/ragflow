package com.ragflow.retrieval.dto.response;

import com.ragflow.retrieval.entity.IndexJob;

import java.time.Instant;

/**
 * The handle returned when an index job is accepted: enough to identify the job
 * and poll it later, not the job's whole state.
 *
 * @param status the {@link com.ragflow.retrieval.enums.JobStatus} name, always
 *               {@code QUEUED} at submission time
 */
public record IndexJobResponse(
        Long jobId,
        String kbId,
        String docId,
        String status,
        Instant submittedAt) {

    public static IndexJobResponse from(IndexJob job) {
        return new IndexJobResponse(
                job.getJobId(),
                job.getKbId(),
                job.getDocId(),
                job.getStatus().name(),
                job.getSubmittedAt());
    }
}
