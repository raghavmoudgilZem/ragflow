using AutoMapper;
using Microsoft.Extensions.Logging;
using Ragflow.FileService.Core.Constants;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.DTOs.Responses;
using Ragflow.FileService.Core.Exceptions;
using Ragflow.FileService.Core.Interfaces;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Interfaces.Persistence;
using System.Net;
using FileEntity = Ragflow.FileService.Domain.Entities.File;

namespace Ragflow.FileService.Core.Services;

public class FileService : IFileService
{
    private readonly IFileRepository _fileRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<FileService> _logger;
    private readonly IMapper _mapper;

    public FileService(
        IFileRepository fileRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILogger<FileService> logger,
        IMapper mapper)
    {
        _fileRepository = fileRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<FileResponse> CreateAsync(
        CreateFileRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Creating {Type} with name '{Name}' by user {UserId}.",
            request.Type,
            request.Name,
            _currentUserService.GetUserId());

        var file = new FileEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            ParentId = request.ParentId,
            Description = request.Description,

            CurrentVersion = 1,
            IsDeleted = false,

            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.GetUserId(),
        };

        await _fileRepository.AddAsync(file, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "{Type} created successfully. FileId: {FileId}",
            file.Type,
            file.Id);

        return _mapper.Map<FileResponse>(file);
    }

    public async Task<FileListResponse> GetFilesAsync(
        GetFilesRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Retrieving files.");

        var files = await _fileRepository.GetFilesAsync(
            request.ParentId,
            request.Search,
            request.Page,
            request.PageSize,
            cancellationToken);

        var total = await _fileRepository.GetTotalCountAsync(
            request.ParentId,
            request.Search,
            cancellationToken);

        return new FileListResponse
        {
            TotalRecords = total,
            Page = request.Page,
            PageSize = request.PageSize,
            Files = _mapper.Map<List<FileResponse>>(files)
        };
    }

        public async Task<FileResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Retrieving file. FileId: {FileId}",
            id);

        var file = await _fileRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (file == null || file.IsDeleted)
        {
            _logger.LogWarning(
                "File not found. FileId: {FileId}",
                id);

            throw new BusinessException(
                ExceptionConstants.FileNotFound,
                HttpStatusCode.NotFound);
        }

        _logger.LogInformation(
            "File retrieved successfully. FileId: {FileId}",
            id);

        return _mapper.Map<FileResponse>(file);
    }

    public async Task<FileResponse> UpdateAsync(
        Guid id,
        UpdateFileRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Updating file metadata. FileId: {FileId}",
            id);

        var file = await _fileRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (file == null || file.IsDeleted)
        {
            _logger.LogWarning(
                "Update failed. File not found. FileId: {FileId}",
                id);

            throw new BusinessException(
                ExceptionConstants.FileNotFound,
                HttpStatusCode.NotFound);
        }

        file.Description = request.Description;

        if (request.ParentId.HasValue)
        {
            file.ParentId = request.ParentId;
        }

        file.UpdatedAt = DateTime.UtcNow;
        file.UpdatedBy = _currentUserService.GetUserId();

        _fileRepository.Update(file);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        _logger.LogInformation(
            "File metadata updated successfully. FileId: {FileId}",
            id);

        return _mapper.Map<FileResponse>(file);
    }

        public async Task<MessageResponse> RenameAsync(
        Guid id,
        RenameFileRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Renaming file. FileId: {FileId}, NewName: {Name}",
            id,
            request.Name);

        var file = await _fileRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (file == null || file.IsDeleted)
        {
            _logger.LogWarning(
                "Rename failed. File not found. FileId: {FileId}",
                id);

            throw new BusinessException(
                ExceptionConstants.FileNotFound,
                HttpStatusCode.NotFound);
        }

        file.Name = request.Name;
        file.UpdatedAt = DateTime.UtcNow;
        file.UpdatedBy = _currentUserService.GetUserId();

        _fileRepository.Update(file);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        _logger.LogInformation(
            "File renamed successfully. FileId: {FileId}",
            id);

        return new MessageResponse
        {
            Success = true,
            Message = "File renamed successfully"
        };
    }

    public async Task<MessageResponse> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Deleting file. FileId: {FileId}",
            id);

        var file = await _fileRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (file == null || file.IsDeleted)
        {
            _logger.LogWarning(
                "Delete failed. File not found. FileId: {FileId}",
                id);

            throw new BusinessException(
                ExceptionConstants.FileNotFound,
                HttpStatusCode.NotFound);
        }

        file.IsDeleted = true;
        file.UpdatedAt = DateTime.UtcNow;
        file.UpdatedBy = _currentUserService.GetUserId();

        _fileRepository.Update(file);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        _logger.LogInformation(
            "File deleted successfully. FileId: {FileId}",
            id);

        return new MessageResponse
        {
            Success = true,
            Message = "File deleted successfully"
        };
    }
}