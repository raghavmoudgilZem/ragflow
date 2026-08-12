
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.DTOs.Responses;
public interface IFileService
{
    Task<FileResponse> CreateAsync(CreateFileRequest request, CancellationToken cancellationToken);

    Task<FileListResponse> GetFilesAsync(GetFilesRequest request, CancellationToken cancellationToken);

    Task<FileResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<FileResponse> UpdateAsync(Guid id, UpdateFileRequest request, CancellationToken cancellationToken);

    Task<MessageResponse> RenameAsync(Guid id, RenameFileRequest request, CancellationToken cancellationToken);

    Task<MessageResponse> DeleteAsync(Guid id, CancellationToken cancellationToken);
}