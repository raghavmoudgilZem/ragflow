package com.ragflow.file.utils;

import com.ragflow.file.enums.FileType;

public class FileTypeDetector {

    private FileTypeDetector(){}

    public static String detect(String filename){

        String name = filename.toLowerCase();

        if(name.matches(".*\\.pdf$"))
            return FileType.PDF.getValue();

        if(name.matches(".*\\.(doc|docx|ppt|pptx|txt|csv|xls|xlsx|md|json|xml|java|py|js|sql|html)$"))
            return FileType.DOC.getValue();

        if(name.matches(".*\\.(mp3|wav|aac|ogg)$"))
            return FileType.AURAL.getValue();

        if(name.matches(".*\\.(png|jpg|jpeg|gif|bmp|svg|webp|mp4|avi|mov|mkv)$"))
            return FileType.VISUAL.getValue();

        return FileType.OTHER.getValue();
    }

}
