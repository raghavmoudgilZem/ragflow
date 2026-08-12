package com.ragflow.retrieval.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ragflow.retrieval.dto.request.ParsedContentRef;

import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import okhttp3.Headers;

/**
 * Two responsibilities, deliberately asymmetric:
 *
 * <ul>
 *   <li>{@code canRead} is a pre-flight check at submit time, so every failure
 *       is swallowed into {@code false} — the caller turns that into a 422.
 *   <li>{@code fetchText} runs inside the worker, where a failure must surface
 *       as an exception so the job is marked FAILED rather than indexed empty.
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
class StorageClientTest {

    @Mock
    private MinioClient minioClient;

    private StorageClient storageClient;

    @BeforeEach
    void setUp() {
        storageClient = new StorageClient(minioClient);
    }

    private static ParsedContentRef ref(String storageType) {
        return new ParsedContentRef(storageType, "parsed", "tenant-1/doc-1.txt");
    }

    private static GetObjectResponse response(String body) {
        InputStream stream = new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8));
        return new GetObjectResponse(Headers.of(), "parsed", null, "tenant-1/doc-1.txt", stream);
    }

    // ---------------------------------------------------------------- canRead

    @Test
    void canRead_isTrueWhenTheObjectStats() throws Exception {
        when(minioClient.statObject(any(StatObjectArgs.class))).thenReturn(null);

        assertThat(storageClient.canRead(ref("MINIO"))).isTrue();
    }

    @Test
    void canRead_statsTheBucketAndKeyFromTheRef() throws Exception {
        when(minioClient.statObject(any(StatObjectArgs.class))).thenReturn(null);

        storageClient.canRead(ref("MINIO"));

        ArgumentCaptor<StatObjectArgs> captor = ArgumentCaptor.forClass(StatObjectArgs.class);
        verify(minioClient).statObject(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("parsed");
        assertThat(captor.getValue().object()).isEqualTo("tenant-1/doc-1.txt");
    }

    @Test
    void canRead_isFalseWhenStatFails() throws Exception {
        // A missing object, a permissions problem, or an unreachable MinIO all
        // collapse to the same answer here: the caller only needs "no".
        when(minioClient.statObject(any(StatObjectArgs.class)))
                .thenThrow(new IOException("connection refused"));

        assertThat(storageClient.canRead(ref("MINIO"))).isFalse();
    }

    @Test
    void canRead_isFalseForANonMinioStorageType() {
        // S3/GCS are not wired up; claiming readability would queue a job the
        // worker cannot possibly run.
        assertThat(storageClient.canRead(ref("S3"))).isFalse();

        verifyNoInteractions(minioClient);
    }

    @Test
    void canRead_acceptsStorageTypeInAnyCase() throws Exception {
        when(minioClient.statObject(any(StatObjectArgs.class))).thenReturn(null);

        assertThat(storageClient.canRead(ref("minio"))).isTrue();
    }

    // -------------------------------------------------------------- fetchText

    @Test
    void fetchText_readsTheObjectAsUtf8() throws Exception {
        when(minioClient.getObject(any(GetObjectArgs.class))).thenReturn(response("héllo\nwörld"));

        assertThat(storageClient.fetchText("MINIO", "parsed", "tenant-1/doc-1.txt"))
                .isEqualTo("héllo\nwörld");
    }

    @Test
    void fetchText_requestsTheGivenBucketAndKey() throws Exception {
        when(minioClient.getObject(any(GetObjectArgs.class))).thenReturn(response("text"));

        storageClient.fetchText("MINIO", "parsed", "tenant-1/doc-1.txt");

        ArgumentCaptor<GetObjectArgs> captor = ArgumentCaptor.forClass(GetObjectArgs.class);
        verify(minioClient).getObject(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("parsed");
        assertThat(captor.getValue().object()).isEqualTo("tenant-1/doc-1.txt");
    }

    @Test
    void fetchText_returnsEmptyStringForAnEmptyObject() throws Exception {
        when(minioClient.getObject(any(GetObjectArgs.class))).thenReturn(response(""));

        // An empty parsed document is not an error — the worker turns zero
        // chunks into a succeeded job.
        assertThat(storageClient.fetchText("MINIO", "parsed", "tenant-1/doc-1.txt")).isEmpty();
    }

    @Test
    void fetchText_rejectsANonMinioStorageType() {
        assertThatThrownBy(() -> storageClient.fetchText("S3", "parsed", "key"))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("S3");
    }

    @Test
    void fetchText_wrapsMinioFailuresAsIOException() throws Exception {
        // Every MinIO SDK exception type is normalised to IOException so the
        // worker has a single failure mode to record on the job.
        when(minioClient.getObject(any(GetObjectArgs.class)))
                .thenThrow(new IllegalStateException("bad state"));

        assertThatThrownBy(() -> storageClient.fetchText("MINIO", "parsed", "tenant-1/doc-1.txt"))
                .isInstanceOf(IOException.class)
                .hasMessageContaining("parsed/tenant-1/doc-1.txt")
                .hasCauseInstanceOf(IllegalStateException.class);
    }

    @Test
    void fetchText_propagatesIOExceptionUnwrapped() throws Exception {
        IOException failure = new IOException("stream closed");
        when(minioClient.getObject(any(GetObjectArgs.class))).thenThrow(failure);

        assertThatThrownBy(() -> storageClient.fetchText("MINIO", "parsed", "tenant-1/doc-1.txt"))
                .isSameAs(failure);
    }
}
