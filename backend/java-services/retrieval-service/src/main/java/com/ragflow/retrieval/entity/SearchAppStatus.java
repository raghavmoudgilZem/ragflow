package com.ragflow.retrieval.entity;

public enum SearchAppStatus {

    ACTIVE("1"),
    DELETED("0");

    private final String code;

    SearchAppStatus(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static SearchAppStatus fromCode(String code) {
        for (SearchAppStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown search app status code: " + code);
    }
}
