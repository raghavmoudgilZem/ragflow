package com.ragflow.file.storage.impl;

import com.ragflow.file.exception.StorageException;
import com.ragflow.file.storage.StorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocalStorageServiceTest {

    @TempDir
    Path tempDir;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private StorageProperties properties;

    private LocalStorageService storageService;

    private final String bucket = "test-bucket";
    private final String key = "sample.txt";
    private final String content = "Hello, Local Storage!";

    @BeforeEach
    void setUp() {
        when(properties.getLocal().getPath()).thenReturn(tempDir.toString());
        storageService = new LocalStorageService(properties);
    }

    // =========================================================================
    // upload() Tests
    // =========================================================================

    @Nested
    @DisplayName("upload Tests")
    class UploadTests {

        @Test
        @DisplayName("Should successfully upload file to target directory")
        void upload_WhenValidInput_ShouldSaveFileToDisk() throws IOException {
            InputStream inputStream = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));

            storageService.upload(bucket, key, inputStream, content.length(), "text/plain");

            Path expectedPath = tempDir.resolve(bucket).resolve(key);
            assertThat(Files.exists(expectedPath)).isTrue();
            assertThat(Files.readString(expectedPath)).isEqualTo(content);
        }

        @Test
        @DisplayName("Should create parent subdirectories when key contains nested paths")
        void upload_WhenNestedKeyProvided_ShouldCreateParentDirectories() throws IOException {
            String nestedKey = "sub/dir/nested-file.txt";
            InputStream inputStream = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));

            storageService.upload(bucket, nestedKey, inputStream, content.length(), "text/plain");

            Path expectedPath = tempDir.resolve(bucket).resolve(nestedKey);
            assertThat(Files.exists(expectedPath)).isTrue();
            assertThat(Files.readString(expectedPath)).isEqualTo(content);
        }

        @Test
        @DisplayName("Should overwrite existing file when uploaded with the same key")
        void upload_WhenFileExists_ShouldOverwrite() throws IOException {
            InputStream firstStream = new ByteArrayInputStream("Original".getBytes(StandardCharsets.UTF_8));
            storageService.upload(bucket, key, firstStream, 8, "text/plain");

            InputStream secondStream = new ByteArrayInputStream("Updated".getBytes(StandardCharsets.UTF_8));
            storageService.upload(bucket, key, secondStream, 7, "text/plain");

            Path expectedPath = tempDir.resolve(bucket).resolve(key);
            assertThat(Files.readString(expectedPath)).isEqualTo("Updated");
        }

        @Test
        @DisplayName("Should throw StorageException when InputStream fails during copy")
        void upload_WhenInputStreamFails_ShouldThrowStorageException() {
            InputStream failingStream = new InputStream() {
                @Override
                public int read() throws IOException {
                    throw new IOException("Stream read failure");
                }
            };

            assertThatThrownBy(() -> storageService.upload(bucket, key, failingStream, 10, "text/plain"))
                    .isInstanceOf(StorageException.class)
                    .hasMessageContaining("Failed to upload file to local storage")
                    .hasCauseInstanceOf(IOException.class);
        }
    }

    // =========================================================================
    // download() Tests
    // =========================================================================

    @Nested
    @DisplayName("download Tests")
    class DownloadTests {

        @Test
        @DisplayName("Should return InputStream with correct content when file exists")
        void download_WhenFileExists_ShouldReturnInputStream() throws IOException {
            Path bucketDir = tempDir.resolve(bucket);
            Files.createDirectories(bucketDir);
            Files.writeString(bucketDir.resolve(key), content);

            try (InputStream stream = storageService.download(bucket, key)) {
                String result = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
                assertThat(result).isEqualTo(content);
            }
        }

        @Test
        @DisplayName("Should throw StorageException when file does not exist")
        void download_WhenFileDoesNotExist_ShouldThrowStorageException() {
            assertThatThrownBy(() -> storageService.download(bucket, "non-existent.txt"))
                    .isInstanceOf(StorageException.class)
                    .hasMessageContaining("Failed to download file from local storage")
                    .hasCauseInstanceOf(IOException.class);
        }
    }

    // =========================================================================
    // delete() Tests
    // =========================================================================

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete file if it exists")
        void delete_WhenFileExists_ShouldRemoveFile() throws IOException {
            Path bucketDir = tempDir.resolve(bucket);
            Files.createDirectories(bucketDir);
            Path filePath = bucketDir.resolve(key);
            Files.createFile(filePath);

            assertThat(Files.exists(filePath)).isTrue();

            storageService.delete(bucket, key);

            assertThat(Files.exists(filePath)).isFalse();
        }

        @Test
        @DisplayName("Should complete gracefully without exception when deleting a missing file")
        void delete_WhenFileDoesNotExist_ShouldNotThrowException() {
            storageService.delete(bucket, "missing-file.txt");

            Path expectedPath = tempDir.resolve(bucket).resolve("missing-file.txt");
            assertThat(Files.exists(expectedPath)).isFalse();
        }
    }

    // =========================================================================
    // exists() Tests
    // =========================================================================

    @Nested
    @DisplayName("exists Tests")
    class ExistsTests {

        @Test
        @DisplayName("Should return true when file exists on disk")
        void exists_WhenFileExists_ShouldReturnTrue() throws IOException {
            Path bucketDir = tempDir.resolve(bucket);
            Files.createDirectories(bucketDir);
            Files.createFile(bucketDir.resolve(key));

            boolean result = storageService.exists(bucket, key);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should return false when file does not exist on disk")
        void exists_WhenFileDoesNotExist_ShouldReturnFalse() {
            boolean result = storageService.exists(bucket, "non-existent.txt");

            assertThat(result).isFalse();
        }
    }

    // =========================================================================
    // move() Tests
    // =========================================================================

    @Nested
    @DisplayName("move Tests")
    class MoveTests {

        @Test
        @DisplayName("Should move file to target destination and create missing parent directories")
        void move_WhenSourceExists_ShouldMoveFileToDestination() throws IOException {
            String srcBucket = "source-bucket";
            String srcKey = "original.txt";
            String destBucket = "dest-bucket";
            String destKey = "subfolder/moved.txt";

            Path srcDir = tempDir.resolve(srcBucket);
            Files.createDirectories(srcDir);
            Path srcFile = srcDir.resolve(srcKey);
            Files.writeString(srcFile, content);

            storageService.move(srcBucket, srcKey, destBucket, destKey);

            Path destFile = tempDir.resolve(destBucket).resolve(destKey);
            assertThat(Files.exists(srcFile)).isFalse();
            assertThat(Files.exists(destFile)).isTrue();
            assertThat(Files.readString(destFile)).isEqualTo(content);
        }

        @Test
        @DisplayName("Should throw StorageException when moving non-existent source file")
        void move_WhenSourceDoesNotExist_ShouldThrowStorageException() {
            assertThatThrownBy(() -> storageService.move("srcBucket", "missing.txt", "destBucket", "target.txt"))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to move file in local storage")
                    .hasCauseInstanceOf(IOException.class);
        }
    }
}