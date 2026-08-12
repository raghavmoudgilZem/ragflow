package com.ragflow.dataset.implementation;

import com.ragflow.dataset.dto.ApiResponseDto;
import com.ragflow.dataset.dto.CreateDatasetRequestDto;
import com.ragflow.dataset.dto.DatasetResponseDto;
import com.ragflow.dataset.dto.TaskTimestampsDto;
import com.ragflow.dataset.entity.Knowledgebase;
import com.ragflow.dataset.enums.ChunkMethod;
import com.ragflow.dataset.enums.ParseType;
import com.ragflow.dataset.exception.DatasetValidationException;
import com.ragflow.dataset.exception.DuplicateDatasetNameException;
import com.ragflow.dataset.exception.ForbiddenException;
import com.ragflow.dataset.exception.ResourceNotFoundException;
import com.ragflow.dataset.records.EmbeddingModelList;
import com.ragflow.dataset.records.Pipeline;
import com.ragflow.dataset.records.UpdateDatasetRequest;
import com.ragflow.dataset.repository.DatasetRepository;
import com.ragflow.dataset.service.DatasetService;
import com.ragflow.dataset.service.EmbeddingModelService;
import com.ragflow.dataset.service.PipelineService;
import com.ragflow.dataset.utility.CommonConstants;
import com.ragflow.dataset.utility.MapApiResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DatasetServiceImpl implements DatasetService {


    private static final DateTimeFormatter TASK_TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final DatasetRepository datasetRepository;
    private final EmbeddingModelService embeddingModelService;
    private final PipelineService pipelineService;


    @Override
    @Transactional
    public ApiResponseDto createDataSet(String tenantId, CreateDatasetRequestDto request) {

        // need to validate tennentId

        if (request.getName() == null || request.getName().isBlank()) {
            throw new DatasetValidationException("Name is required");
        }
        String name = request.getName().trim();

        if (datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(tenantId, name, "1")) {
            throw new DuplicateDatasetNameException(name);
        }

        if (request.getEmbeddingModel() == null || request.getEmbeddingModel().isBlank()) {
            throw new DatasetValidationException("Embedding model is required");
        }
        EmbeddingModelList embeddingModel = embeddingModelService.validateAndGet(tenantId, request.getEmbeddingModel());


        String parserId;
        String pipelineId = null;

        ParseType parseType = request.getParseType() != null ? request.getParseType() : ParseType.BUILT_IN;
        if (parseType == ParseType.BUILT_IN) {
            if (request.getChunkMethod() == null ) {
                throw new DatasetValidationException("Please select a chunking method");
            }
            parserId = request.getChunkMethod().getCode();
        } else {
            if (request.getPipeline() == null || request.getPipeline().isBlank()) {
                throw new DatasetValidationException("Please select a pipeline");
            }

            Pipeline pipeline = pipelineService.validateAndGet(tenantId, request.getPipeline());
            pipelineId = pipeline.id();
            parserId = ChunkMethod.GENERAL.getCode(); // Knowledgebase.parserId is not-null; keep a sane default
        }

        Knowledgebase kb = Knowledgebase.builder()
                .tenantId(tenantId)
                .createdBy(tenantId)
                .name(name)
                .avatar(request.getAvatar())
                .description(request.getDescription())
                .permission(request.getPermission().getCode())
                .parserId(parserId)
                .parserConfig(CommonConstants.PARSERCONFIG)
                .embdId(embeddingModel.id())
                .pipelineId(pipelineId)
                .createTime(LocalDateTime.now())
                .updateTime(LocalDateTime.now())
                .docNum(1)
                .build();

        Knowledgebase knb = datasetRepository.save(kb);
        Knowledgebase reloaded = datasetRepository.findById(knb.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dataset created failed"));
        return MapApiResponse.mapToApiResponse("New Dataset Created successfully", HttpStatus.CREATED.value(), reloaded);
    }

    @Override
    public ApiResponseDto getDatasetDetail(UUID id, String tenantId) {

        Knowledgebase kb = datasetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(CommonConstants.DATASET_NOT_FOUND));

        if("0".equalsIgnoreCase(kb.getStatus())){
            throw new ResourceNotFoundException("Dataset is temporary deleted and will be deleted in some days!");
        }
        // Security: tenant membership check -> 403 on mismatch
        if (kb.getTenantId() == null || !kb.getTenantId().equals(tenantId)) {
            throw new ForbiddenException("You do not have access to this dataset");
        }
        EmbeddingModelList embeddingModel = embeddingModelService.validateAndGet(tenantId, kb.getEmbdId());


        // Format task finish timestamps (graphrag, raptor, mindmap)
        TaskTimestampsDto taskTimestamps = TaskTimestampsDto.builder()
                .graphragTaskFinishAt(formatTimestamp(kb.getGraphragTaskFinishAt()))
                .raptorTaskFinishAt(formatTimestamp(kb.getRaptorTaskFinishAt()))
                .mindmapTaskFinishAt(formatTimestamp(kb.getMindmapTaskFinishAt()))
                .build();

        DatasetResponseDto detail = DatasetResponseDto.builder()
                .id(kb.getId())
                .name(kb.getName())
                .avatar(kb.getAvatar())
                .description(kb.getDescription())
                .embeddingModel(embeddingModel.name()) // will add embedding model once this model get developed
                .permission(kb.getPermission())
                .parserConfig(kb.getParserConfig())
                .taskTimestamps(taskTimestamps)
                .updateTime(kb.getUpdateTime())
                .status(kb.getStatus())
                .language(kb.getLanguage())
                .docNum(kb.getDocNum())
                .createTime(kb.getCreateTime())
                .tenantId(kb.getTenantId())
                .chunkMethod(kb.getParserId())
                .build();


        return MapApiResponse.mapToApiResponse("Dataset detail fetched successfully", HttpStatus.OK.value(), detail);
    }

    @Override
    public ApiResponseDto getAllDatasetDetail(String tenantId) {
        List<Knowledgebase> byTenantId = datasetRepository.findByTenantId(tenantId);

        if (byTenantId.isEmpty()){
            throw new ForbiddenException("You do not have access to this dataset");
        }

        List<DatasetResponseDto> datasets = byTenantId.stream()
                .filter(a->"1".equalsIgnoreCase(a.getStatus()))
                .map(kb -> {
                    TaskTimestampsDto taskTimestamps = TaskTimestampsDto.builder()
                            .graphragTaskFinishAt(formatTimestamp(kb.getGraphragTaskFinishAt()))
                            .raptorTaskFinishAt(formatTimestamp(kb.getRaptorTaskFinishAt()))
                            .mindmapTaskFinishAt(formatTimestamp(kb.getMindmapTaskFinishAt()))
                            .build();

                    EmbeddingModelList embeddingModel = embeddingModelService.validateAndGet(tenantId, kb.getEmbdId());

                    return DatasetResponseDto.builder()
                            .id(kb.getId())
                            .name(kb.getName())
                            .avatar(kb.getAvatar())
                            .description(kb.getDescription())
                            .embeddingModel(embeddingModel.name()) // will add embedding model once this model get developed
                            .permission(kb.getPermission())
                            .parserConfig(kb.getParserConfig())
                            .taskTimestamps(taskTimestamps)
                            .updateTime(kb.getUpdateTime())
                            .status(kb.getStatus())
                            .language(kb.getLanguage())
                            .docNum(kb.getDocNum())
                            .createTime(kb.getCreateTime())
                            .tenantId(kb.getTenantId())
                            .chunkMethod(kb.getParserId())
                            .build();
                })
                .toList();

        return MapApiResponse.mapToApiResponse(
                "Dataset details fetched successfully",
                HttpStatus.OK.value(),
                datasets
        );
    }

    @Transactional
    public ApiResponseDto updateDataset(UUID id, String tenantId, UpdateDatasetRequest request) {

        Knowledgebase kb = datasetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(CommonConstants.DATASET_NOT_FOUND));

        validateDatasetAccess(kb,tenantId);

        boolean nameChanged = request.name() != null && !request.name().trim().equals(kb.getName());

        if (nameChanged) {

            String newName = request.name().trim();
            if (newName.getBytes(StandardCharsets.UTF_8).length > 128 || newName.length()<4) {
                throw new DatasetValidationException("Name must be at most 128 bytes and greater that 4");
            }
            if (datasetRepository.existsByTenantIdAndNameIgnoreCaseAndStatus(tenantId, newName, "1")) {
                throw new DuplicateDatasetNameException(newName);
            }
        }
        else{
            throw new DuplicateDatasetNameException("You are Updating with same DataSet name, Kindly update new one!");
        }

        if (request.parserId() != null && ChunkMethod.fromCode(request.parserId()) == null) {
            throw new DatasetValidationException("parser_id is not a recognized parser type");
        }

        kb.setName(request.name().trim());
        if (request.description() != null) {
            kb.setDescription(request.description());
        }
        if (request.parserId() != null) {
            kb.setParserId(request.parserId());
        }
        kb.setUpdateTime(LocalDateTime.now());

        Knowledgebase detail = datasetRepository.save(kb);

        return MapApiResponse.mapToApiResponse("Dataset updated successfully", HttpStatus.OK.value(), detail);
    }


    private void validateDatasetAccess(Knowledgebase kb, String tenantId) {
        if (!Objects.equals(kb.getTenantId(), tenantId)) {
            throw new ForbiddenException("You do not have access to this dataset");
        }
        if (!Objects.equals(kb.getCreatedBy(), tenantId)) {
            throw new ForbiddenException("Only the dataset owner can update it");
        }
    }

    @Override
    @Transactional
    public ApiResponseDto deleteDataset(UUID id, String tenantId) {

            Knowledgebase kb = datasetRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(CommonConstants.DATASET_NOT_FOUND));

            // Security: tenant + ownership check.
            if (kb.getTenantId() == null || !kb.getTenantId().equals(tenantId)) {
                throw new ForbiddenException("You do not have access to this dataset");
            }
            if (kb.getCreatedBy() == null || !kb.getCreatedBy().equals(tenantId)) {
                throw new ForbiddenException("Only the dataset owner can delete it");
            }

            if ("team".equalsIgnoreCase(kb.getPermission())) {
                throw new ForbiddenException(
                        "This is a shared (team) dataset -- explicit deletion permission is required");
            }
            kb.setDocNum(0);
            kb.setStatus("0");
        datasetRepository.save(kb);

        return MapApiResponse.mapToApiResponse("Dataset Deleted successfully", HttpStatus.OK.value(), null);
    }

    private String formatTimestamp(LocalDateTime time) {
        return time == null ? null : time.format(TASK_TIMESTAMP_FORMATTER);
    }

}
