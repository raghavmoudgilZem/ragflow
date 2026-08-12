package com.ragflow.document.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "file_2_document", indexes = {
        @Index(name = "idx_f2d_file_id", columnList = "file_id"),
        @Index(name = "idx_f2d_document_id", columnList = "document_id")
})
public class File2Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @Column(name = "file_id", length = 36)
    private String fileId;

    @Column(name = "document_id", length = 36)
    private String documentId;
}