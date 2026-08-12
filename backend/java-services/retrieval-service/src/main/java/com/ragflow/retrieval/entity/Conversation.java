package com.ragflow.retrieval.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "conversation")
@Data
public class Conversation {

    @Id
    private String id;

    private String name;

    @Column(name = "create_time")
    private Long createTime;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "dialog_id")
    private String dialogId;
}
