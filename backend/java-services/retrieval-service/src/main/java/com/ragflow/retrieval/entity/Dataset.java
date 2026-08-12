package com.ragflow.retrieval.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "knowledgebase")
public class Dataset {

    @Id
    private String id;

    private String name;

    private String description;

    @Column(name = "create_time")
    private Long createTime;

    @Column(name = "update_time")
    private Long updateTime;

    @Column(name = "doc_num")
    private Integer docNum;

    @Column(name = "chunk_num")
    private Integer chunkNum;

    @Column(name = "token_num")
    private Integer tokenNum;

    @Column(name = "tenant_id")
    private String tenantId;
}
