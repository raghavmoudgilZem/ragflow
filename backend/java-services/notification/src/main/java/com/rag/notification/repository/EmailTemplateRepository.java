package com.rag.notification.repository;

import com.rag.notification.entity.EmailTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {

    boolean existsByTemplateSlug(String templateSlug);

    Optional<EmailTemplate> findByTemplateSlugAndVersion(String templateSlug, Integer version);

    @Query("SELECT MAX(t.version) FROM EmailTemplate t WHERE t.templateSlug = :slug")
    Optional<Integer> findMaxVersionByTemplateSlug(@Param("slug") String slug);

    Page<EmailTemplate> findByStatus(Boolean status, Pageable pageable);
}