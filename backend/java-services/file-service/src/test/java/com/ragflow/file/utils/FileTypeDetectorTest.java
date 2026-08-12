package com.ragflow.file.utils;

import com.ragflow.file.enums.FileType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;

import static org.assertj.core.api.Assertions.assertThat;

class FileTypeDetectorTest {

    // =========================================================================
    // PDF Category Tests
    // =========================================================================

    @Nested
    @DisplayName("PDF File Tests")
    class PdfTests {

        @ParameterizedTest
        @ValueSource(strings = {"document.pdf", "REPORT.PDF", "my.file.v2.pdf", "path/to/file.Pdf"})
        @DisplayName("Should detect PDF type for PDF files regardless of case")
        void detect_WhenPdfFile_ShouldReturnPdfType(String filename) {
            String result = FileTypeDetector.detect(filename);
            assertThat(result).isEqualTo(FileType.PDF.getValue());
        }
    }

    // =========================================================================
    // DOC Category Tests
    // =========================================================================

    @Nested
    @DisplayName("Document File Tests")
    class DocTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "file.doc", "file.docx", "file.ppt", "file.pptx", "file.txt",
                "file.csv", "file.xls", "file.xlsx", "file.md", "file.json",
                "file.xml", "file.java", "file.py", "file.js", "file.sql", "file.html",
                "README.TXT", "script.PY", "index.HTML"
        })
        @DisplayName("Should detect DOC type for document and code files")
        void detect_WhenDocFile_ShouldReturnDocType(String filename) {
            String result = FileTypeDetector.detect(filename);
            assertThat(result).isEqualTo(FileType.DOC.getValue());
        }
    }

    // =========================================================================
    // AURAL Category Tests
    // =========================================================================

    @Nested
    @DisplayName("Aural/Audio File Tests")
    class AuralTests {

        @ParameterizedTest
        @ValueSource(strings = {"song.mp3", "audio.wav", "track.aac", "sound.ogg", "RECORDING.MP3"})
        @DisplayName("Should detect AURAL type for audio files")
        void detect_WhenAudioFile_ShouldReturnAuralType(String filename) {
            String result = FileTypeDetector.detect(filename);
            assertThat(result).isEqualTo(FileType.AURAL.getValue());
        }
    }

    // =========================================================================
    // VISUAL Category Tests
    // =========================================================================

    @Nested
    @DisplayName("Visual/Image/Video File Tests")
    class VisualTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "image.png", "photo.jpg", "photo.jpeg", "anim.gif", "graphic.bmp",
                "icon.svg", "web.webp", "movie.mp4", "clip.avi", "film.mov", "video.mkv",
                "AVATAR.PNG", "MOVIE.MP4"
        })
        @DisplayName("Should detect VISUAL type for image and video files")
        void detect_WhenVisualFile_ShouldReturnVisualType(String filename) {
            String result = FileTypeDetector.detect(filename);
            assertThat(result).isEqualTo(FileType.VISUAL.getValue());
        }
    }

    // =========================================================================
    // OTHER Category / Fallback Tests
    // =========================================================================

    @Nested
    @DisplayName("Unknown / Fallback File Tests")
    class OtherTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "archive.zip", "data.tar.gz", "app.exe", "file.bin", "unknown",
                "file.pdf.bak", "pdf_without_extension"
        })
        @DisplayName("Should return OTHER type for unsupported or missing extensions")
        void detect_WhenUnknownExtension_ShouldReturnOtherType(String filename) {
            String result = FileTypeDetector.detect(filename);
            assertThat(result).isEqualTo(FileType.OTHER.getValue());
        }
    }

    // =========================================================================
    // Utility Class Code Coverage
    // =========================================================================

    @Test
    @DisplayName("Should verify private constructor for 100% code coverage")
    void testPrivateConstructor() throws Exception {
        Constructor<FileTypeDetector> constructor = FileTypeDetector.class.getDeclaredConstructor();
        assertThat(Modifier.isPrivate(constructor.getModifiers())).isTrue();
        constructor.setAccessible(true);
        FileTypeDetector instance = constructor.newInstance();
        assertThat(instance).isNotNull();
    }
}
