package com.ragflow.document.repository;

import com.ragflow.document.model.File2Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface File2DocumentRepository extends JpaRepository<File2Document, String> {

    List<File2Document> findByFileId(String fileId);

    List<File2Document> findByDocumentId(String documentId);

    boolean existsByDocumentId(String docId);
}