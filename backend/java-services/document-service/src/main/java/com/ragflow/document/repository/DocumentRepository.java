package com.ragflow.document.repository;

import com.ragflow.document.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String>, JpaSpecificationExecutor<Document> {

    List<Document> findByIdIn(List<String> docIds);

    boolean existsByNameAndKbId(String name, String kbId);

    @Query("SELECT d.id, d.metaFields FROM Document d WHERE d.kbId IN :kbIds")
    List<Object[]> findMetaFieldsByKbIds(List<String> kbIds);

    int countByKbIdIn(List<String> kbIds);

    boolean existsByKbIdIn(List<String> kbIdList);
}