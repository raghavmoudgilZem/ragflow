
using Ragflow.FileService.Core.Interfaces;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Infrastructure.Persistence;

namespace Ragflow.Identity.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly FileDbContext _context;

    public UnitOfWork(
        FileDbContext context)
    {
        _context = context;
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}