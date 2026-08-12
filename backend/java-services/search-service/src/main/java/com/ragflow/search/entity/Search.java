package com.ragflow.search.entity;

import com.ragflow.search.constant.AppConstants;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.Date;

/**
 * @ Data generates toString/equals/hashCode which can cause
 * issues with JPA lazy loading and circular references.
 */
@Entity
@Table(name = "search", indexes = {
        @Index(name = "idx_search_tenant_id",   columnList = "tenant_id"),
        @Index(name = "idx_search_created_by",  columnList = "created_by"),
        @Index(name = "idx_search_status",      columnList = "status"),
        @Index(name = "idx_search_update_time", columnList = "update_time")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Search {

    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Column(name = "created_by", length = 36, nullable = false)
    private String createdBy;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar;

    /** Serialised JSON config — matches Python search_config field */
    @Column(name = "search_config", columnDefinition = "JSON")
    private String searchConfig;

    /**
     * 1 = VALID (active)
     * 0 = INVALID (soft deleted)
     * Matches Python StatusEnum.VALID.value = 1
     */
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Integer status = 1;

    /** Unix millisecond timestamp — matches Python current_timestamp() */
    @Column(name = "create_time", nullable = false)
    private Long createTime;

    /** Formatted date string — matches Python datetime_format() */
    @Column(name = "create_date", length = 20)
    private String createDate;

    @Column(name = "update_time", nullable = false)
    private Long updateTime;

    @Column(name = "update_date", length = 20)
    private String updateDate;
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern(AppConstants.DATE_TIME_FORMAT);

    @PrePersist
    protected void onCreate() {
        long now = System.currentTimeMillis();
        String formatted = new SimpleDateFormat(AppConstants.DATE_TIME_FORMAT).format(new Date(now));
        this.createTime = now;
        this.updateTime = now;
        this.createDate = formatted;
        this.updateDate = formatted;
        if (this.status == null) this.status = 1;
    }

    @PreUpdate
    protected void onUpdate() {
        long now = System.currentTimeMillis();
        this.updateTime = now;
        this.updateDate = new SimpleDateFormat(AppConstants.DATE_TIME_FORMAT).format(new Date(now));
    }
}