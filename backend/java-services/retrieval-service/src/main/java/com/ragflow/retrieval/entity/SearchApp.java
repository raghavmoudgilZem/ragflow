package com.ragflow.retrieval.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Getter
@Setter
@Table(name = "searchApp")
public class SearchApp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @Column(name = "create_time")
    private Long createTime;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "update_time")
    private Long updateTime;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "search_config", columnDefinition = "TEXT")
    @Convert(converter = SearchConfigConverter.class)
    private SearchConfig searchConfig;

    @Column(name = "status")
    private String status;
}