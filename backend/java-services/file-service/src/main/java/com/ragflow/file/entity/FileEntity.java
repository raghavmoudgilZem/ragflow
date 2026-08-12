package com.ragflow.file.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "file",
        indexes = {@Index(name = "pr_id_name_idx", columnList = "parent_id,name"),
                @Index(name = "tenant_idx", columnList = "tenant_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileEntity {

    @Id
    private UUID id;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "tenant_id")
    private UUID tenantId;

    private String location;

    private String name;

    private Long size;

    @Column(name = "source_type")
    private String sourceType;

    private String type;

    @Column(name = "has_child_folder")
    private Boolean hasChildFolder;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "kbs_info")
    private List<KbInfo> kbsInfo;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "storage_filename")
    private String storageFilename;

    @Column(name = "storage_bucket")
    private String storageBucket;

    @Column(name = "storage_key")
    private String storageKey;

    @Column(name = "storage_provider")
    private String storageProvider;
}