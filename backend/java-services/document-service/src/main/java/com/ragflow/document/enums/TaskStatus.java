package com.ragflow.document.enums;

import lombok.Getter;

@Getter
public enum TaskStatus {
    UNSTART("0"),
    RUNNING("1"),
    CANCEL("2"),
    DONE("3"),
    FAIL("4"),
    SCHEDULE("5");

    private final String statusCode;

    TaskStatus(String statusCode) {
        this.statusCode = statusCode;
    }

    /**
     * Optional: Checks if a string value matches any of the valid task statuses.
     * Use this to safely validate your incoming request headers or parameters.
     */
    public static boolean isValid(String statusStr) {
        if (statusStr == null) return false;

        for (TaskStatus status : TaskStatus.values()) {
            if (status.getStatusCode().equalsIgnoreCase(statusStr.trim())) {
                return true;
            }
        }
        return false;
    }
}