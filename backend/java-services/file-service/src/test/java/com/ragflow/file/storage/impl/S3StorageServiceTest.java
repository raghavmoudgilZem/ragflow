package com.ragflow.file.storage.impl;

import com.ragflow.file.exception.StorageException;
import com.ragflow.file.storage.StorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3StorageServiceTest {

    @Mock
    private S3Client client;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private StorageProperties properties;

    @Mock
    private ResponseInputStream<GetObjectResponse> mockResponseInputStream;

    @InjectMocks
    private S3StorageService s3StorageService;

    private final String mainS3Bucket = "main-ragflow-s3-bucket";
    private final String bucket = "my-bucket";
    private final String key = "uploads/document.pdf";
    private final String contentType = "application/pdf";
    private final long size = 2048L;

    @BeforeEach
    void setUp() {
        lenient().when(properties.getS3().getBucket()).thenReturn(mainS3Bucket);
    }

    // =========================================================================
    // upload() Tests
    // =========================================================================

    @Nested
    @DisplayName("upload Tests")
    class UploadTests {

        @Test
        @DisplayName("Should successfully upload file to S3 with correct request parameters")
        void upload_WhenValidInput_ShouldInvokePutObject() {
            InputStream inputStream = new ByteArrayInputStream("Sample Data".getBytes());
            PutObjectResponse mockResponse = PutObjectResponse.builder().build();
            when(client.putObject(any(PutObjectRequest.class), any(RequestBody.class))).thenReturn(mockResponse);

            s3StorageService.upload(bucket, key, inputStream, size, contentType);

            ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
            verify(client, times(1)).putObject(requestCaptor.capture(), any(RequestBody.class));

            PutObjectRequest request = requestCaptor.getValue();
            assertThat(request.bucket()).isEqualTo(bucket);
            assertThat(request.key()).isEqualTo(key);
            assertThat(request.contentType()).isEqualTo(contentType);
        }

        @Test
        @DisplayName("Should wrap SdkException in StorageException when putObject fails")
        void upload_WhenS3ClientThrowsException_ShouldThrowStorageException() {
            InputStream inputStream = new ByteArrayInputStream("Sample Data".getBytes());
            when(client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                    .thenThrow(S3Exception.builder().message("Access Denied").build());

            assertThatThrownBy(() -> s3StorageService.upload(bucket, key, inputStream, size, contentType))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to upload file to S3 storage: " + key)
                    .hasCauseInstanceOf(S3Exception.class);
        }
    }

    // =========================================================================
    // download() Tests
    // =========================================================================

    @Nested
    @DisplayName("download Tests")
    class DownloadTests {

        @Test
        @DisplayName("Should return ResponseInputStream when object exists in S3")
        void download_WhenObjectExists_ShouldReturnInputStream() {
            when(client.getObject(any(GetObjectRequest.class))).thenReturn(mockResponseInputStream);

            InputStream resultStream = s3StorageService.download(bucket, key);

            assertThat(resultStream).isNotNull().isEqualTo(mockResponseInputStream);

            ArgumentCaptor<GetObjectRequest> captor = ArgumentCaptor.forClass(GetObjectRequest.class);
            verify(client, times(1)).getObject(captor.capture());

            GetObjectRequest request = captor.getValue();
            assertThat(request.bucket()).isEqualTo(bucket);
            assertThat(request.key()).isEqualTo(key);
        }

        @Test
        @DisplayName("Should throw StorageException with 'File not found' message on NoSuchKeyException")
        void download_WhenObjectNotFound_ShouldThrowSpecificStorageException() {
            when(client.getObject(any(GetObjectRequest.class)))
                    .thenThrow(NoSuchKeyException.builder().message("Key missing").build());

            assertThatThrownBy(() -> s3StorageService.download(bucket, key))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("File not found in S3 storage: " + key)
                    .hasCauseInstanceOf(NoSuchKeyException.class);
        }

        @Test
        @DisplayName("Should throw generic StorageException on general SdkException")
        void download_WhenGeneralSdkException_ShouldThrowStorageException() {
            when(client.getObject(any(GetObjectRequest.class)))
                    .thenThrow(SdkClientException.create("Network error"));

            assertThatThrownBy(() -> s3StorageService.download(bucket, key))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to download file from S3 storage: " + key)
                    .hasCauseInstanceOf(SdkClientException.class);
        }
    }

    // =========================================================================
    // delete() Tests
    // =========================================================================

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should invoke deleteObject on S3 client with correct parameters")
        void delete_WhenValidInput_ShouldInvokeDeleteObject() {
            DeleteObjectResponse mockResponse = DeleteObjectResponse.builder().build();
            when(client.deleteObject(any(DeleteObjectRequest.class))).thenReturn(mockResponse);

            s3StorageService.delete(bucket, key);

            ArgumentCaptor<DeleteObjectRequest> captor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
            verify(client, times(1)).deleteObject(captor.capture());

            DeleteObjectRequest request = captor.getValue();
            assertThat(request.bucket()).isEqualTo(bucket);
            assertThat(request.key()).isEqualTo(key);
        }

        @Test
        @DisplayName("Should throw StorageException when deleteObject fails")
        void delete_WhenClientThrowsException_ShouldThrowStorageException() {
            when(client.deleteObject(any(DeleteObjectRequest.class)))
                    .thenThrow(S3Exception.builder().message("S3 delete failed").build());

            assertThatThrownBy(() -> s3StorageService.delete(bucket, key))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to delete file from S3 storage: " + key)
                    .hasCauseInstanceOf(S3Exception.class);
        }
    }

    // =========================================================================
    // exists() Tests
    // =========================================================================

    @Nested
    @DisplayName("exists Tests")
    class ExistsTests {

        @Test
        @DisplayName("Should return true when headObject succeeds")
        void exists_WhenObjectExists_ShouldReturnTrue() {
            HeadObjectResponse mockResponse = HeadObjectResponse.builder().build();
            when(client.headObject(any(HeadObjectRequest.class))).thenReturn(mockResponse);

            boolean exists = s3StorageService.exists(bucket, key);

            assertThat(exists).isTrue();

            ArgumentCaptor<HeadObjectRequest> captor = ArgumentCaptor.forClass(HeadObjectRequest.class);
            verify(client, times(1)).headObject(captor.capture());

            HeadObjectRequest request = captor.getValue();
            assertThat(request.bucket()).isEqualTo(bucket);
            assertThat(request.key()).isEqualTo(key);
        }

        @Test
        @DisplayName("Should return false when headObject throws NoSuchKeyException")
        void exists_WhenNoSuchKeyException_ShouldReturnFalse() {
            when(client.headObject(any(HeadObjectRequest.class)))
                    .thenThrow(NoSuchKeyException.builder().message("Key not found").build());

            boolean exists = s3StorageService.exists(bucket, key);

            assertThat(exists).isFalse();
        }

        @Test
        @DisplayName("Should return false when S3Exception has status code 404")
        void exists_WhenS3Exception404_ShouldReturnFalse() {
            when(client.headObject(any(HeadObjectRequest.class)))
                    .thenThrow(S3Exception.builder().statusCode(404).message("Not Found").build());

            boolean exists = s3StorageService.exists(bucket, key);

            assertThat(exists).isFalse();
        }

        @Test
        @DisplayName("Should throw StorageException when S3Exception status code is not 404")
        void exists_WhenS3ExceptionNon404_ShouldThrowStorageException() {
            when(client.headObject(any(HeadObjectRequest.class)))
                    .thenThrow(S3Exception.builder().statusCode(500).message("Internal Error").build());

            assertThatThrownBy(() -> s3StorageService.exists(bucket, key))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to check file existence in S3 storage")
                    .hasCauseInstanceOf(S3Exception.class);
        }

        @Test
        @DisplayName("Should throw StorageException on general SdkException")
        void exists_WhenSdkException_ShouldThrowStorageException() {
            when(client.headObject(any(HeadObjectRequest.class)))
                    .thenThrow(SdkClientException.create("Network Failure"));

            assertThatThrownBy(() -> s3StorageService.exists(bucket, key))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to check file existence in S3 storage")
                    .hasCauseInstanceOf(SdkClientException.class);
        }
    }

    // =========================================================================
    // move() Tests
    // =========================================================================

    @Nested
    @DisplayName("move Tests")
    class MoveTests {

        @Test
        @DisplayName("Should copy object to destination using main S3 bucket name and delete original source object")
        void move_WhenValidInput_ShouldCopyObjectAndDeleteOriginal() {
            String srcBucket = "srcBucket";
            String srcKey = "source.pdf";
            String destBucket = "destBucket";
            String destKey = "destination.pdf";

            String expectedCopySource = mainS3Bucket + "/" + srcBucket + "/" + srcKey;
            String expectedDestKey = destBucket + "/" + destKey;

            when(client.copyObject(any(CopyObjectRequest.class)))
                    .thenReturn(CopyObjectResponse.builder().build());
            when(client.deleteObject(any(DeleteObjectRequest.class)))
                    .thenReturn(DeleteObjectResponse.builder().build());

            s3StorageService.move(srcBucket, srcKey, destBucket, destKey);

            ArgumentCaptor<CopyObjectRequest> copyCaptor = ArgumentCaptor.forClass(CopyObjectRequest.class);
            verify(client, times(1)).copyObject(copyCaptor.capture());

            CopyObjectRequest copyRequest = copyCaptor.getValue();
            assertThat(copyRequest.copySource()).isEqualTo(expectedCopySource);
            assertThat(copyRequest.bucket()).isEqualTo(mainS3Bucket);
            assertThat(copyRequest.key()).isEqualTo(expectedDestKey);

            ArgumentCaptor<DeleteObjectRequest> deleteCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
            verify(client, times(1)).deleteObject(deleteCaptor.capture());

            DeleteObjectRequest deleteRequest = deleteCaptor.getValue();
            assertThat(deleteRequest.bucket()).isEqualTo(srcBucket);
            assertThat(deleteRequest.key()).isEqualTo(srcKey);
        }

        @Test
        @DisplayName("Should throw StorageException and not attempt delete when copyObject fails")
        void move_WhenCopyFails_ShouldThrowStorageExceptionAndNotDelete() {
            when(client.copyObject(any(CopyObjectRequest.class)))
                    .thenThrow(S3Exception.builder().message("Copy failed").build());

            assertThatThrownBy(() -> s3StorageService.move("srcBucket", "a.pdf", "destBucket", "b.pdf"))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to move file in S3 storage")
                    .hasCauseInstanceOf(S3Exception.class);

            verify(client, never()).deleteObject(any(DeleteObjectRequest.class));
        }
    }
}