package com.ragflow.file.utils;

import org.springframework.http.MediaType;

import java.net.URLConnection;

public class MimeTypeUtil {

    private MimeTypeUtil() {
    }

    public static MediaType getMediaType(String filename) {
        // Defensive check for null or blank inputs before calling URLConnection
        if (filename == null || filename.isBlank()) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        String mime = URLConnection.guessContentTypeFromName(filename);

        if (mime == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        return MediaType.parseMediaType(mime);
    }
}
