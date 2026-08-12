package com.ragflow.file.repository;

import com.ragflow.file.entity.FileEntity;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, UUID> {

    Optional<List<FileEntity>> findAllByParentId(UUID parentId);

    boolean existsByParentIdAndName(UUID parentId, String name);

    Optional<FileEntity> findByTenantIdAndParentId(UUID tenantId, UUID parentId);

    Optional<FileEntity> findAllByParentIdAndNameAndType(UUID parentId, String name, String type);

    Optional<FileEntity> findAllByParentIdAndName(UUID parentId, String name);

    void delete(@NonNull FileEntity entity);

    @Query("""
            SELECT f
            FROM FileEntity f
            WHERE
                  f.tenantId = :tenantId
              AND f.parentId = :parentId
              AND f.id <> :parentId
            """)
    Page<FileEntity> listFiles(@Param("tenantId") UUID tenantId, @Param("parentId") UUID parentId, Pageable pageable);

    @Query("""
            SELECT f
            FROM FileEntity f
            WHERE
                  f.tenantId = :tenantId
              AND f.parentId = :parentId
              AND lower(f.name) like lower(concat('%',:keyword,'%'))
              AND f.id <> :parentId
            """)
    Page<FileEntity> searchFiles(@Param("tenantId") UUID tenantId, @Param("parentId") UUID parentId, @Param("keyword") String keyword, Pageable pageable);

    @Query("""
            SELECT f
            FROM FileEntity f
            WHERE f.id = (
                    SELECT c.parentId
                    FROM FileEntity c
                    WHERE c.id = :id
            )
            """)
    Optional<FileEntity> getParentFolder(@Param("id") UUID id);

}
