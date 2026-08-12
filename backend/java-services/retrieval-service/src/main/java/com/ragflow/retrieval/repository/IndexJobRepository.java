package com.ragflow.retrieval.repository;

import com.ragflow.retrieval.entity.IndexJob;
import com.ragflow.retrieval.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface IndexJobRepository extends JpaRepository<IndexJob,Long> {

    List<IndexJob> findByDocIdAndStatusInOrderBySubmittedAtDesc(String docId, List<JobStatus> statuses);

    default Optional<IndexJob> findActiveJobForDoc(String docId) {
        return findByDocIdAndStatusInOrderBySubmittedAtDesc(
                docId, List.of(JobStatus.QUEUED, JobStatus.RUNNING))
                .stream()
                .findFirst();
    }

    @Query("select j.status from IndexJob j where j.jobId = :jobId")
    Optional<JobStatus> findStatus(@Param("jobId") Long jobId);


    @Transactional
    @Modifying
    @Query("update IndexJob j set j.status = :status, j.startedAt = :startedAt " +
            "where j.jobId = :jobId")
    int markRunning(@Param("jobId") Long jobId,
                    @Param("status") JobStatus status,
                    @Param("startedAt") Instant startedAt);

    @Transactional
    @Modifying
    @Query("update IndexJob j set j.progress = :progress, j.chunkCount = :chunkCount, " +
            "j.tokenCount = :tokenCount where j.jobId = :jobId")
    int updateProgress(@Param("jobId") Long jobId,
                       @Param("progress") float progress,
                       @Param("chunkCount") int chunkCount,
                       @Param("tokenCount") int tokenCount);

    @Transactional
    @Modifying
    @Query("update IndexJob j set j.status = :status, j.finishedAt = :finishedAt, " +
            "j.progress = :progress where j.jobId = :jobId")
    int markSucceeded(@Param("jobId") Long jobId,
                      @Param("status") JobStatus status,
                      @Param("finishedAt") Instant finishedAt,
                      @Param("progress") float progress);


    @Transactional
    @Modifying
    @Query("update IndexJob j set j.status = :status, j.finishedAt = :finishedAt, " +
            "j.errorMessage = :errorMessage where j.jobId = :jobId")
    int markFailed(@Param("jobId") Long jobId,
                   @Param("status") JobStatus status,
                   @Param("finishedAt") Instant finishedAt,
                   @Param("errorMessage") String errorMessage);



    /**
     * True if some OTHER job for this docId already reached SUCCEEDED.
     * Used by the worker to tell "first successful index of this doc"
     * (bump index_registry.doc_count) apart from "re-index of an
     * already-indexed doc" (doc_count unchanged) when a job completes.
     */
    @Query("select case when count(j) > 0 then true else false end from IndexJob j " +
            "where j.docId = :docId and j.status = 'SUCCEEDED' and j.id <> :excludingJobId")
    boolean existsSucceededForDocExcluding(@Param("docId") String docId,
                                           @Param("excludingJobId") Long excludingJobId);

}
