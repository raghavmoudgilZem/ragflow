using Document.Application.DTOs.Common;
using Document.Application.DTOs.External;

namespace Document.Application.Interfaces.Clients;

public interface IFileServiceClient
{
    Task<UploadFileResponse> UploadFileAsync(
        FileUploadRequest file,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task DeleteFileAsync(
        Guid fileId,
        CancellationToken cancellationToken = default);
}