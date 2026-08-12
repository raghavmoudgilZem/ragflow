package com.ragflow.dataset.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Permission {
    ME("me"),
    TEAM("team");

    private final String code;

}
