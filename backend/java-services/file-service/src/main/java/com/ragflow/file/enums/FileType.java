package com.ragflow.file.enums;

public enum FileType {

    FOLDER("folder"),
    VIRTUAL("virtual"),
    PDF("pdf"),
    DOC("doc"),
    AURAL("aural"),
    VISUAL("visual"),
    OTHER("other");

    private final String value;

    FileType(String value){
        this.value=value;
    }

    public String getValue(){
        return value;
    }
}