package com.ragflow.document.repository;

import com.ragflow.document.model.PipelineOperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PipelineOperationLogRepository extends JpaRepository<PipelineOperationLog, String> {
}