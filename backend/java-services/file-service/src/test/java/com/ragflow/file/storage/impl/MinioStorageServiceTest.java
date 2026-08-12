package com.ragflow.file.storage.impl;

import com.ragflow.file.exception.StorageException;
import com.ragflow.file.storage.StorageProperties;
import io.minio.*;
import io.minio.messages.ErrorResponse;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.ServerException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MinioStorageServiceTest {

    @Mock
    private MinioClient client;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private StorageProperties properties;

    @InjectMocks
    private MinioStorageService minioStorageService;

    private final String bucketName = "test-bucket";
    private final String folderId = "folder-123";
    private final String filename = "report.pdf";
    private final String expectedObjectKey = folderId + "/" + filename;
    private final String contentType = "application/pdf";
    private final long size = 1024L;

    @BeforeEach
    void setUp() {
        lenient().when(properties.getMinio().getBucket()).thenReturn(bucketName);
    }

    // =========================================================================
    // upload() Tests
    // =========================================================================

    @Nested
    @DisplayName("upload Tests")
    class UploadTests {

        @Test
        @DisplayName("Should successfully upload object with folderId/filename path")
        void upload_WhenValidInput_ShouldInvokePutObject() throws Exception {
            InputStream inputStream = new ByteArrayInputStream("Test Data".getBytes());
            ObjectWriteResponse mockResponse = mock(ObjectWriteResponse.class);

            when(mockResponse.bucket()).thenReturn(bucketName);
            when(mockResponse.object()).thenReturn(expectedObjectKey);
            when(mockResponse.etag()).thenReturn("etag-123");
            when(client.putObject(any(PutObjectArgs.class))).thenReturn(mockResponse);

            minioStorageService.upload(folderId, filename, inputStream, size, contentType);

            ArgumentCaptor<PutObjectArgs> captor = ArgumentCaptor.forClass(PutObjectArgs.class);
            verify(client, times(1)).putObject(captor.capture());

            PutObjectArgs args = captor.getValue();
            assertThat(args.bucket()).isEqualTo(bucketName);
            assertThat(args.object()).isEqualTo(expectedObjectKey);
            assertThat(args.contentType()).isEqualTo(contentType);
        }

        @Test
        @DisplayName("Should throw StorageException when client throws an exception during upload")
        void upload_WhenMinioFails_ShouldThrowStorageException() throws Exception {
            InputStream inputStream = new ByteArrayInputStream("Test Data".getBytes());

            // Pass HTTP status code 500 instead of null
            when(client.putObject(any(PutObjectArgs.class)))
                    .thenThrow(new ServerException("Server error", 500, null));

            assertThatThrownBy(() -> minioStorageService.upload(folderId, filename, inputStream, size, contentType))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to upload file to storage: " + filename)
                    .hasCauseInstanceOf(ServerException.class);
        }
    }

    // =========================================================================
    // download() Tests
    // =========================================================================

    @Nested
    @DisplayName("download Tests")
    class DownloadTests {

        @Test
        @DisplayName("Should return GetObjectResponse InputStream when object exists")
        void download_WhenObjectExists_ShouldReturnInputStream() throws Exception {
            GetObjectResponse mockResponse = mock(GetObjectResponse.class);
            when(client.getObject(any(GetObjectArgs.class))).thenReturn(mockResponse);

            InputStream result = minioStorageService.download(folderId, filename);

            assertThat(result).isNotNull().isEqualTo(mockResponse);

            ArgumentCaptor<GetObjectArgs> captor = ArgumentCaptor.forClass(GetObjectArgs.class);
            verify(client, times(1)).getObject(captor.capture());

            GetObjectArgs args = captor.getValue();
            assertThat(args.bucket()).isEqualTo(bucketName);
            assertThat(args.object()).isEqualTo(expectedObjectKey);
        }

        @Test
        @DisplayName("Should throw StorageException when download operation fails")
        void download_WhenMinioFails_ShouldThrowStorageException() throws Exception {
            when(client.getObject(any(GetObjectArgs.class)))
                    .thenThrow(new ServerException("Download error",500 ,null));

            assertThatThrownBy(() -> minioStorageService.download(folderId, filename))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to download file from storage: " + filename)
                    .hasCauseInstanceOf(ServerException.class);
        }
    }

    // =========================================================================
    // delete() Tests
    // =========================================================================

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should invoke removeObject on MinIO client successfully")
        void delete_WhenValidInput_ShouldRemoveObject() throws Exception {
            doNothing().when(client).removeObject(any(RemoveObjectArgs.class));

            minioStorageService.delete(folderId, filename);

            ArgumentCaptor<RemoveObjectArgs> captor = ArgumentCaptor.forClass(RemoveObjectArgs.class);
            verify(client, times(1)).removeObject(captor.capture());

            RemoveObjectArgs args = captor.getValue();
            assertThat(args.bucket()).isEqualTo(bucketName);
            assertThat(args.object()).isEqualTo(expectedObjectKey);
        }

        @Test
        @DisplayName("Should throw StorageException when deletion fails")
        void delete_WhenMinioFails_ShouldThrowStorageException() throws Exception {
            doThrow(new ServerException("Deletion error", 500, null))
                    .when(client).removeObject(any(RemoveObjectArgs.class));

            assertThatThrownBy(() -> minioStorageService.delete(folderId, filename))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to delete file from storage: " + filename)
                    .hasCauseInstanceOf(ServerException.class);
        }
    }

    // =========================================================================
    // exists() Tests
    // =========================================================================

    @Nested
    @DisplayName("exists Tests")
    class ExistsTests {

        @Test
        @DisplayName("Should return true when statObject succeeds")
        void exists_WhenObjectExists_ShouldReturnTrue() throws Exception {
            StatObjectResponse mockStat = mock(StatObjectResponse.class);
            when(client.statObject(any(StatObjectArgs.class))).thenReturn(mockStat);

            boolean exists = minioStorageService.exists(folderId, filename);

            assertThat(exists).isTrue();

            ArgumentCaptor<StatObjectArgs> captor = ArgumentCaptor.forClass(StatObjectArgs.class);
            verify(client, times(1)).statObject(captor.capture());

            StatObjectArgs args = captor.getValue();
            assertThat(args.bucket()).isEqualTo(bucketName);
            assertThat(args.object()).isEqualTo(expectedObjectKey);
        }

        @ParameterizedTest
        @ValueSource(strings = {"NoSuchKey", "NoSuchBucket"})
        @DisplayName("Should return false when ErrorResponseException code is NoSuchKey or NoSuchBucket")
        void exists_WhenObjectOrBucketNotFound_ShouldReturnFalse(String errorCode) throws Exception {
            ErrorResponse mockErrorResponse = mock(ErrorResponse.class);
            when(mockErrorResponse.code()).thenReturn(errorCode);

            ErrorResponseException exception = mock(ErrorResponseException.class);
            when(exception.errorResponse()).thenReturn(mockErrorResponse);

            when(client.statObject(any(StatObjectArgs.class))).thenThrow(exception);

            boolean exists = minioStorageService.exists(folderId, filename);

            assertThat(exists).isFalse();
        }

        @Test
        @DisplayName("Should throw StorageException when ErrorResponseException returns an unexpected error code")
        void exists_WhenOtherMinioErrorCode_ShouldThrowStorageException() throws Exception {
            ErrorResponse mockErrorResponse = mock(ErrorResponse.class);
            when(mockErrorResponse.code()).thenReturn("AccessDenied");

            ErrorResponseException exception = mock(ErrorResponseException.class);
            when(exception.errorResponse()).thenReturn(mockErrorResponse);

            when(client.statObject(any(StatObjectArgs.class))).thenThrow(exception);

            assertThatThrownBy(() -> minioStorageService.exists(folderId, filename))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to check file existence in storage")
                    .hasCauseInstanceOf(ErrorResponseException.class);
        }

        @Test
        @DisplayName("Should throw StorageException on unexpected MinIO exceptions")
        void exists_WhenGeneralMinioException_ShouldThrowStorageException() throws Exception {
            when(client.statObject(any(StatObjectArgs.class)))
                    .thenThrow(new ServerException("Internal error",500, null));

            assertThatThrownBy(() -> minioStorageService.exists(folderId, filename))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Storage error occurred while checking file existence")
                    .hasCauseInstanceOf(ServerException.class);
        }
    }

    // =========================================================================
    // move() Tests
    // =========================================================================

    @Nested
    @DisplayName("move Tests")
    class MoveTests {

        @Test
        @DisplayName("Should copy object to target destination and delete original object")
        void move_WhenValidInput_ShouldCopyAndDeleteOriginal() throws Exception {
            String srcFolder = "src-folder";
            String srcFile = "file.pdf";
            String destFolder = "dest-folder";
            String destFile = "moved-file.pdf";

            ObjectWriteResponse mockCopyResponse = mock(ObjectWriteResponse.class);
            when(client.copyObject(any(CopyObjectArgs.class))).thenReturn(mockCopyResponse);
            doNothing().when(client).removeObject(any(RemoveObjectArgs.class));

            minioStorageService.move(srcFolder, srcFile, destFolder, destFile);

            ArgumentCaptor<CopyObjectArgs> copyCaptor = ArgumentCaptor.forClass(CopyObjectArgs.class);
            verify(client, times(1)).copyObject(copyCaptor.capture());

            CopyObjectArgs copyArgs = copyCaptor.getValue();
            assertThat(copyArgs.bucket()).isEqualTo(bucketName);
            assertThat(copyArgs.object()).isEqualTo(destFolder + "/" + destFile);

            ArgumentCaptor<RemoveObjectArgs> removeCaptor = ArgumentCaptor.forClass(RemoveObjectArgs.class);
            verify(client, times(1)).removeObject(removeCaptor.capture());

            RemoveObjectArgs removeArgs = removeCaptor.getValue();
            assertThat(removeArgs.bucket()).isEqualTo(bucketName);
            assertThat(removeArgs.object()).isEqualTo(srcFolder + "/" + srcFile);
        }

        @Test
        @DisplayName("Should throw StorageException when copyObject operation fails")
        void move_WhenCopyFails_ShouldThrowStorageExceptionAndNotDelete() throws Exception {
            when(client.copyObject(any(CopyObjectArgs.class)))
                    .thenThrow(new ServerException("Copy operation failed",500, null));

            assertThatThrownBy(() -> minioStorageService.move("src", "a.pdf", "dest", "b.pdf"))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to move file in storage")
                    .hasCauseInstanceOf(ServerException.class);

            verify(client, never()).removeObject(any(RemoveObjectArgs.class));
        }
    }
}