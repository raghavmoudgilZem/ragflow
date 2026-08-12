package com.ragflow.dataset.enums;

/**
 * Mirrors the Python `ParserType` values accepted by `chunk_method` in
 * CreateDatasetReq. Persisted to Knowledgebase.parserId. Defaults to NAIVE
 * server-side when omitted, matching create_dataset's implicit default.
 */
public enum ChunkMethod {
    GENERAL("general"),
    BOOK("book"),
    EMAIL("email"),
    LAWS("laws"),
    MANUAL("manual"),
    ONE("one"),
    PAPER("paper"),
    PICTURE("picture"),
    PRESENTATION("presentation"),
    QA("qa"),
    TABLE("table"),
    TAG("tag");

    private final String code;

    ChunkMethod(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static ChunkMethod fromCode(String code) {
        for (ChunkMethod m : values()) {
            if (m.code.equalsIgnoreCase(code)) {
                return m;
            }
        }
        return null;
    }
}
