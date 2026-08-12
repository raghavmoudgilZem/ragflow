namespace Ragflow.FileService.Core.Interfaces.Common;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}