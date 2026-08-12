using FileEntity = Ragflow.FileService.Domain.Entities.File;
using Ragflow.FileService.Core.Interfaces.Common;
using File = Ragflow.FileService.Domain.Entities.File;

namespace Ragflow.FileService.Core.Interfaces.Persistence;

public interface IFileRepository : IGenericRepository<FileEntity>
{
    Task<IEnumerable<FileEntity>> GetFilesAsync(
        Guid? parentId,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<int> GetTotalCountAsync(
        Guid? parentId,
        string? search,
        CancellationToken cancellationToken);
}