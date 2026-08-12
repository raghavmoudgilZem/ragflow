package com.ragflow.dataset.controller;

import com.ragflow.dataset.dto.ApiResponseDto;
import com.ragflow.dataset.dto.CreateDatasetRequestDto;
import com.ragflow.dataset.implementation.DatasetServiceImpl;
import com.ragflow.dataset.records.UpdateDatasetRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for DatasetController.createDataset. The service is mocked here,
 * so these tests only assert the controller's own responsibilities: it
 * delegates to the service with the right arguments and wraps the result in
 * a 201 CREATED response. Service-level behaviour (validation, duplicate
 * name handling, etc.) is covered separately in DatasetServiceImplTest.
 */
@ExtendWith(MockitoExtension.class)
class DatasetControllerTest {

    @Mock
    private DatasetServiceImpl datasetServiceImpl;

    @InjectMocks
    private DatasetController datasetController;

    private CreateDatasetRequestDto request;
    private static final String TENANT_ID = "tenant-123";

    @BeforeEach
    void setUp() {
        request = CreateDatasetRequestDto.builder()
                .name("Support Docs")
                .build();
    }

    @Test
    void createDataset_delegatesToServiceAndReturns201() {
        ApiResponseDto expectedResponse = mock(ApiResponseDto.class);
        when(datasetServiceImpl.createDataSet(eq(TENANT_ID), any(CreateDatasetRequestDto.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<ApiResponseDto> response = datasetController.createDataset(TENANT_ID, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(datasetServiceImpl).createDataSet(TENANT_ID, request);
    }

    @Test
    void createDataset_passesThroughExactRequestPayload() {
        ApiResponseDto expectedResponse = mock(ApiResponseDto.class);
        when(datasetServiceImpl.createDataSet(anyString(), any(CreateDatasetRequestDto.class)))
                .thenReturn(expectedResponse);

        datasetController.createDataset(TENANT_ID, request);

        // Confirms the controller forwards the same request object rather than
        // rebuilding/mutating it before calling the service.
        verify(datasetServiceImpl).createDataSet(TENANT_ID, request);
    }

    @Test
    void createDataset_propagatesServiceExceptions() {
        // e.g. DuplicateDatasetNameException / DatasetValidationException thrown
        // by the service layer should bubble up uncaught here -- your
        // GlobalExceptionHandler (@RestControllerAdvice) is what's responsible
        // for translating them into error responses, not the controller itself.
        when(datasetServiceImpl.createDataSet(anyString(), any(CreateDatasetRequestDto.class)))
                .thenThrow(new RuntimeException("service failure"));

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class,
                () -> datasetController.createDataset(TENANT_ID, request));
    }

    @Test
    void testGetAllDatasetDetail() {

        String tenantId = "tenant-123";

        ApiResponseDto responseDto = ApiResponseDto.builder()
                .code(HttpStatus.FOUND.value())
                .message("Datasets fetched successfully")
                .build();

        when(datasetServiceImpl.getAllDatasetDetail(tenantId))
                .thenReturn(responseDto);

        ResponseEntity<ApiResponseDto> response =
                datasetController.getAllDatasetDetail(tenantId);

        assertEquals(HttpStatus.FOUND, response.getStatusCode());
        assertEquals(responseDto, response.getBody());

        verify(datasetServiceImpl).getAllDatasetDetail(tenantId);
    }

    @Test
    void testGetDatasetDetail() {

        UUID datasetId = UUID.randomUUID();
        String tenantId = "tenant-123";

        ApiResponseDto responseDto = ApiResponseDto.builder()
                .code(HttpStatus.FOUND.value())
                .message("Dataset fetched successfully")
                .build();

        when(datasetServiceImpl.getDatasetDetail(datasetId, tenantId))
                .thenReturn(responseDto);

        ResponseEntity<ApiResponseDto> response =
                datasetController.getDatasetDetail(datasetId, tenantId);

        assertEquals(HttpStatus.FOUND, response.getStatusCode());
        assertEquals(responseDto, response.getBody());

        verify(datasetServiceImpl).getDatasetDetail(datasetId, tenantId);
    }

    @Test
    void testUpdateDataset() {

        UUID datasetId = UUID.fromString("5869eb1b-9a06-49f9-9cd5-ca3a461e8dde");
        String tenantId = "321";

        UpdateDatasetRequest req = UpdateDatasetRequest.builder()
                .name("Updated Dataset")
                .description("Updated Description")
                .build();

        ApiResponseDto responseDto = ApiResponseDto.builder()
                .code(HttpStatus.ACCEPTED.value())
                .message("Dataset updated successfully")
                .build();

        when(datasetServiceImpl.updateDataset(datasetId, tenantId, req))
                .thenReturn(responseDto);

        ResponseEntity<ApiResponseDto> response =
                datasetController.updateDataset(datasetId, tenantId, req);

        assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
        assertEquals(responseDto, response.getBody());

        verify(datasetServiceImpl)
                .updateDataset(datasetId, tenantId, req);
    }

    @Test
    void testDeleteDataset() {

        UUID datasetId = UUID.fromString("5869eb1b-9a06-49f9-9cd5-ca3a461e8dde");
        String tenantId = "tenant-123";

        ApiResponseDto responseDto = ApiResponseDto.builder()
                .code(HttpStatus.OK.value())
                .message("Dataset Deleted successfully")
                .build();

        when(datasetServiceImpl.deleteDataset(datasetId, tenantId))
                .thenReturn(responseDto);

        ResponseEntity<ApiResponseDto> response =
                datasetController.deleteDataset(datasetId, tenantId);

        assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
        assertEquals(responseDto, response.getBody());

        verify(datasetServiceImpl).deleteDataset(datasetId, tenantId);
    }


}
