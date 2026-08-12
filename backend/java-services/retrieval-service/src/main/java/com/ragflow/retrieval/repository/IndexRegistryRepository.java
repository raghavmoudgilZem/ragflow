package com.ragflow.retrieval.repository;

import com.ragflow.retrieval.entity.IndexRegistry;
import com.ragflow.retrieval.enums.IndexRegistryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface IndexRegistryRepository extends JpaRepository<IndexRegistry,String> {

    Optional<IndexRegistry> findByKbId(String kbId);

    /**
     * Denormalized counters, bumped on A1 completion (worker) and on
     * A4/A5 (delete chunks / drop index) — per the ERD notes.
     */
    @Transactional
    @Modifying
    @Query("update IndexRegistry r set r.docCount = r.docCount + :docDelta, " +
            "r.chunkCount = r.chunkCount + :chunkDelta, r.updatedAt = :updatedAt " +
            "where r.kbId = :kbId")
    int adjustCounts(@Param("kbId") String kbId,
                     @Param("docDelta") int docDelta,
                     @Param("chunkDelta") int chunkDelta,
                     @Param("updatedAt") Instant updatedAt);



    /**
     * BUILDING -> ACTIVE transition, fired by the worker the first time any
     * job against this KB actually succeeds. Without this, status never
     * leaves BUILDING and IndexJobService's embedding-model-mismatch check
     * (which only fires when status == ACTIVE) never activates.
     * No-op if already ACTIVE/DELETING/DELETED (guarded by the WHERE).
     */
    @Transactional
    @Modifying
    @Query("update IndexRegistry r set r.status = :active, r.updatedAt = :updatedAt " +
            "where r.kbId = :kbId and r.status = :building")
    int activateIfBuilding(@Param("kbId") String kbId,
                           @Param("updatedAt") Instant updatedAt,
                           @Param("building") IndexRegistryStatus building,
                           @Param("active") IndexRegistryStatus active);
}
