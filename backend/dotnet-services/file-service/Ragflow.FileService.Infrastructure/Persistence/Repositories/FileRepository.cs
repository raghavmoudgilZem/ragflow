using Microsoft.EntityFrameworkCore;
using Ragflow.FileService.Core.Interfaces.Persistence;
using FileEntity = Ragflow.FileService.Domain.Entities.File;

namespace Ragflow.FileService.Infrastructure.Persistence.Repositories;

public class FileRepository : GenericRepository<FileEntity>, IFileRepository
{
    private readonly FileDbContext _context;

    public FileRepository(FileDbContext context)
        : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FileEntity>> GetFilesAsync(
        Guid? parentId,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        IQueryable<FileEntity> query = _context.Files;

        query = query.Where(x => !x.IsDeleted);

        if (parentId.HasValue)
        {
            query = query.Where(x => x.ParentId == parentId);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search));
        }

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetTotalCountAsync(
        Guid? parentId,
        string? search,
        CancellationToken cancellationToken = default)
    {
        IQueryable<FileEntity> query = _context.Files;

        query = query.Where(x => !x.IsDeleted);

        if (parentId.HasValue)
        {
            query = query.Where(x => x.ParentId == parentId);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search));
        }

        return await query.CountAsync(cancellationToken);
    }
}