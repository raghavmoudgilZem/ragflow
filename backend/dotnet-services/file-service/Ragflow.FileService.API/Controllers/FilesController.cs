using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Ragflow.FileService.API.Constants;
using Ragflow.FileService.Core.DTOs.Common;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.DTOs.Responses;

namespace Ragflow.FileService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Base)]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly ILogger<FilesController> _logger;

    public FilesController(
        IFileService fileService,
        ILogger<FilesController> logger)
    {
        _fileService = fileService;
        _logger = logger;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateFileRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received create file request. Name: {Name}, Type: {Type}",
            request.Name,
            request.Type);

        var response = await _fileService.CreateAsync(
            request,
            cancellationToken);

        _logger.LogInformation(
            "File created successfully. Id: {Id}",
            response.Id);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            ApiResponse<FileResponse>.SuccessResponse(response));
    }

    [HttpGet]
    public async Task<IActionResult> GetFiles(
        [FromQuery] GetFilesRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received get files request. ParentId: {ParentId}, Search: {Search}",
            request.ParentId,
            request.Search);

        var response = await _fileService.GetFilesAsync(
            request,
            cancellationToken);

        _logger.LogInformation(
            "Retrieved {Count} files.",
            response.Files.Count);

        return Ok(ApiResponse<FileListResponse>.SuccessResponse(response));
    }

    [Authorize]
    [HttpGet(ApiRoutes.ById)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received get file request. Id: {Id}",
            id);

        var response = await _fileService.GetByIdAsync(
            id,
            cancellationToken);

        _logger.LogInformation(
            "File retrieved successfully. Id: {Id}",
            id);

        return Ok(ApiResponse<FileResponse>.SuccessResponse(response!));
    }

    [Authorize]
    [HttpPut(ApiRoutes.ById)]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateFileRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received update file request. Id: {Id}",
            id);

        var response = await _fileService.UpdateAsync(
            id,
            request,
            cancellationToken);

        _logger.LogInformation(
            "File updated successfully. Id: {Id}",
            id);

        return Ok(ApiResponse<FileResponse>.SuccessResponse(response));
    }

    [Authorize]
    [HttpPatch(ApiRoutes.Rename)]
    public async Task<IActionResult> Rename(
        Guid id,
        RenameFileRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received rename file request. Id: {Id}, NewName: {Name}",
            id,
            request.Name);

        var response = await _fileService.RenameAsync(
            id,
            request,
            cancellationToken);

        _logger.LogInformation(
            "File renamed successfully. Id: {Id}",
            id);

        return Ok(ApiResponse<MessageResponse>.SuccessResponse(response));
    }

    [Authorize]
    [HttpDelete(ApiRoutes.ById)]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received delete file request. Id: {Id}",
            id);

        var response = await _fileService.DeleteAsync(
            id,
            cancellationToken);

        _logger.LogInformation(
            "File deleted successfully. Id: {Id}",
            id);

        return Ok(ApiResponse<MessageResponse>.SuccessResponse(response));
    }
}