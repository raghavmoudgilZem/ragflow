package com.ragflow.document.utility;

import lombok.experimental.UtilityClass;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

@UtilityClass
public class Utility {

    private static final Pattern PRESENTATION_PATTERN = Pattern.compile(".*\\.(ppt|pptx|pages)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern EMAIL_PATTERN = Pattern.compile(".*\\.(msg|eml)$", Pattern.CASE_INSENSITIVE);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);

    public static String extractSuffix(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    public static String getParser(String docType, String filename, String defaultParser) {
        if ("visual".equals(docType)) {
            return "picture";
        }
        if ("aural".equals(docType)) {
            return "audio";
        }
        if (PRESENTATION_PATTERN.matcher(filename).matches()) {
            return "presentation";
        }
        if (EMAIL_PATTERN.matcher(filename).matches()) {
            return "email";
        }
        return defaultParser;
    }

    public static String getFileExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }

        String fileName = Path.of(filename).getFileName().toString();
        int index = fileName.lastIndexOf('.');

        if (index <= 0 || index == fileName.length() - 1) {
            return "";
        }

        return fileName.substring(index + 1);
    }

    public static String formatDate(LocalDateTime date) {
        if (date == null) return null;
        return DATE_FORMATTER.format(date.atZone(ZoneId.systemDefault()));
    }
}
