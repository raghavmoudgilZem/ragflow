package com.ragflow.file.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;

import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;

import static org.assertj.core.api.Assertions.assertThat;

class MimeTypeUtilTest {

    // =========================================================================
    // getMediaType Tests
    // =========================================================================

    @Nested
    @DisplayName("getMediaType Tests")
    class GetMediaTypeTests {

        @ParameterizedTest
        @CsvSource({
                "document.pdf, application/pdf",
                "image.png, image/png",
                "photo.jpg, image/jpeg",
                "page.html, text/html"
        })
        @DisplayName("Should return correct MediaType for recognized file extensions")
        void getMediaType_WhenKnownFilename_ShouldReturnCorrespondingMediaType(String filename, String expectedMime) {
            MediaType result = MimeTypeUtil.getMediaType(filename);

            assertThat(result).isNotNull();
            assertThat(result.toString()).isEqualTo(expectedMime);
        }

        @ParameterizedTest
        @ValueSource(strings = {"file.unknown123", "filename_without_extension", "", "   "})
        @DisplayName("Should return APPLICATION_OCTET_STREAM when MIME type cannot be guessed")
        void getMediaType_WhenUnknownOrEmptyFilename_ShouldReturnOctetStream(String filename) {
            MediaType result = MimeTypeUtil.getMediaType(filename);

            assertThat(result).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        }

        @Test
        @DisplayName("Should return APPLICATION_OCTET_STREAM when filename is null")
        void getMediaType_WhenFilenameIsNull_ShouldReturnOctetStream() {
            MediaType result = MimeTypeUtil.getMediaType(null);

            assertThat(result).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        }
    }

    // =========================================================================
    // Utility Class Code Coverage
    // =========================================================================

    @Test
    @DisplayName("Should verify private constructor for 100% code coverage")
    void testPrivateConstructor() throws Exception {
        Constructor<MimeTypeUtil> constructor = MimeTypeUtil.class.getDeclaredConstructor();
        assertThat(Modifier.isPrivate(constructor.getModifiers())).isTrue();

        constructor.setAccessible(true);
        MimeTypeUtil instance = constructor.newInstance();
        assertThat(instance).isNotNull();
    }
}