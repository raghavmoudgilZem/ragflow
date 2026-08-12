using FluentValidation;
using KnowledgeBase.Application.Common;
using KnowledgeBase.Application.DTOs.Dataset;
using KnowledgeBase.Application.Exceptions;
using KnowledgeBase.Application.Interfaces.Repositories;
using KnowledgeBase.Application.Interfaces.Services;
using KnowledgeBase.Domain.Entities;
using Microsoft.Extensions.Logging;
using KnowledgeBaseEntity = KnowledgeBase.Domain.Entities.KnowledgeBase;
namespace KnowledgeBase.Application.Services;

public sealed class KnowledgeBaseService : IKnowledgeBaseService
{
    private readonly IKnowledgeBaseRepository _knowledgeBaseRepository;
    private readonly IValidator<CreateDatasetRequest> _validator;
    private readonly ILogger<KnowledgeBaseService> _logger;
    private readonly IValidator<GetDatasetsRequest> _getDatasetsValidator;
    private readonly IValidator<UpdateDatasetRequest> _updateDatasetValidator;
    public KnowledgeBaseService(
        IKnowledgeBaseRepository knowledgeBaseRepository,
        IValidator<CreateDatasetRequest> validator,
        ILogger<KnowledgeBaseService> logger,
        IValidator<GetDatasetsRequest> getDatasetsValidator,
        IValidator<UpdateDatasetRequest> updateDatasetValidator)
    {
        _knowledgeBaseRepository = knowledgeBaseRepository;
        _validator = validator;
        _logger = logger;
        _getDatasetsValidator = getDatasetsValidator;
        _updateDatasetValidator = updateDatasetValidator;
    }

    public async Task<CreateDatasetResponse> CreateDatasetAsync(
        CreateDatasetRequest request,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Creating dataset '{DatasetName}' for Tenant {TenantId}",
            request.Name,
            tenantId);

        // Validate Request
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Check duplicate dataset
        bool exists = await _knowledgeBaseRepository.ExistsAsync(
            tenantId,
            request.Name,
            cancellationToken);

        if (exists)
        {
            _logger.LogWarning(
                "Dataset '{DatasetName}' already exists for Tenant {TenantId}",
                request.Name,
                tenantId);

            throw new DuplicateDatasetException(request.Name);
        }

        // Create Entity
        var knowledgeBase = new KnowledgeBaseEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = request.Name.Trim(),
            Description = request.Description,
            Language = request.Language,
            Permission = request.Permission,
            EmbeddingModel = request.EmbeddingModel,
            ParserId = request.ParserId,
            ChunkMethod = request.ChunkMethod,
            Status = "Active",
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        // Save
        await _knowledgeBaseRepository.AddAsync(
            knowledgeBase,
            cancellationToken);

        await _knowledgeBaseRepository.SaveChangesAsync(
            cancellationToken);

        _logger.LogInformation(
            "Dataset '{DatasetName}' created successfully with Id {DatasetId}",
            knowledgeBase.Name,
            knowledgeBase.Id);

        // Response
        return new CreateDatasetResponse
        {
            Id = knowledgeBase.Id,
            Name = knowledgeBase.Name,
            Description = knowledgeBase.Description ?? string.Empty,
            Language = knowledgeBase.Language,
            Permission = knowledgeBase.Permission,
            Status = knowledgeBase.Status,
            CreatedAt = knowledgeBase.CreatedAt
        };
    }
    public async Task<PagedResult<DatasetDto>> GetDatasetsAsync(
        GetDatasetsRequest request, Guid tenantId,
        CancellationToken cancellationToken = default)
    {

        _logger.LogInformation(
            "Fetching datasets for Tenant {TenantId}",
            tenantId);

        // Validate Request
        var validationResult = await _getDatasetsValidator.ValidateAsync(
            request,
            cancellationToken);

        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Repository Call
        var datasets = await _knowledgeBaseRepository.GetPagedAsync(
            tenantId,
            request,
            cancellationToken);

        // Mapping
        var response = new PagedResult<DatasetDto>
        {
            Items = datasets.Items
                .Select(x => new DatasetDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    Language = x.Language,
                    Permission = x.Permission,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .ToList(),

            PageNumber = datasets.PageNumber,
            PageSize = datasets.PageSize,
            TotalRecords = datasets.TotalRecords
        };

        _logger.LogInformation(
            "Returned {Count} datasets for Tenant {TenantId}",
            response.Items.Count,
            tenantId);

        return response;
    }
    public async Task<GetDatasetByIdResponse> GetDatasetByIdAsync(
    Guid id,
    Guid tenantId,
    CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Fetching dataset {DatasetId} for Tenant {TenantId}",
            id,
            tenantId);

        var dataset = await _knowledgeBaseRepository.GetByIdAsync(
            id,
            tenantId,
            cancellationToken);

        if (dataset is null)
        {
            // throw new KeyNotFoundException(
            //     $"Dataset '{id}' was not found.");
            throw new DatasetNotFoundException(id);
        }

        return new GetDatasetByIdResponse
        {
            Id = dataset.Id,
            Name = dataset.Name,
            Description = dataset.Description,
            Language = dataset.Language,
            Permission = dataset.Permission,
            EmbeddingModel = dataset.EmbeddingModel,
            ParserId = dataset.ParserId,
            ChunkMethod = dataset.ChunkMethod,
            Status = dataset.Status,
            CreatedBy = dataset.CreatedBy,
            CreatedAt = dataset.CreatedAt,

            UpdatedAt = dataset.UpdatedAt
        };
    }
    public async Task<UpdateDatasetResponse> UpdateDatasetAsync(
        Guid id,
        Guid tenantId,
        Guid userId,
        UpdateDatasetRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Updating dataset {DatasetId} for Tenant {TenantId}",
            id,
            tenantId);

        // Validate Request
        var validationResult = await _updateDatasetValidator.ValidateAsync(
            request,
            cancellationToken);

        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Get Dataset
        var dataset = await _knowledgeBaseRepository.GetByIdAsync(
            id,
            tenantId,
            cancellationToken);

        if (dataset is null)
        {
            // throw new KeyNotFoundException($"Dataset '{id}' not found.");
            throw new DatasetNotFoundException(id);
        }

        // Duplicate Name Check (only if name changed)
        if (!string.Equals(dataset.Name, request.Name, StringComparison.OrdinalIgnoreCase))
        {
            var exists = await _knowledgeBaseRepository.ExistsAsync(
                tenantId,
                request.Name,
                cancellationToken);

            if (exists)
            {
                // throw new InvalidOperationException(
                //     $"Dataset '{request.Name}' already exists.");
                throw new DuplicateDatasetException(request.Name);
            }
        }

        // Update Editable Fields
        dataset.Name = request.Name.Trim();
        dataset.Description = request.Description?.Trim();
        dataset.Language = request.Language;
        dataset.Permission = request.Permission;
        dataset.EmbeddingModel = request.EmbeddingModel;
        dataset.ParserId = request.ParserId;
        dataset.ChunkMethod = request.ChunkMethod;

        // Audit Fields
        dataset.UpdatedBy = userId;
        dataset.UpdatedAt = DateTime.UtcNow;

        // Persist Changes
        await _knowledgeBaseRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Dataset {DatasetId} updated successfully.",
            dataset.Id);

        // Response
        return new UpdateDatasetResponse
        {
            Id = dataset.Id,
            Name = dataset.Name,
            Description = dataset.Description,
            Language = dataset.Language,
            Permission = dataset.Permission,
            EmbeddingModel = dataset.EmbeddingModel,
            ParserId = dataset.ParserId,
            ChunkMethod = dataset.ChunkMethod,
            UpdatedAt = dataset.UpdatedAt!.Value
        };
    }
    public async Task DeleteDatasetAsync(
        Guid id,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Deleting dataset {DatasetId} for Tenant {TenantId}",
            id,
            tenantId);

        // Retrieve dataset with tenant isolation
        var dataset = await _knowledgeBaseRepository.GetByIdAsync(
            id,
            tenantId,
            cancellationToken);

        if (dataset is null)
        {
            _logger.LogWarning(
                "Dataset {DatasetId} not found for Tenant {TenantId}",
                id,
                tenantId);

            // throw new KeyNotFoundException($"Dataset '{id}' not found.");
            throw new DatasetNotFoundException(id);
        }

        // Delete entity
        _knowledgeBaseRepository.Remove(dataset);

        // Persist changes
        await _knowledgeBaseRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Dataset {DatasetId} deleted successfully.",
            id);
    }
}