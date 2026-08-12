using Document.Application.Interfaces.Persistence;

namespace Document.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly DocumentDbContext _context;

    public UnitOfWork(DocumentDbContext context)
    {
        _context = context;
    }

    public async Task<int> CommitAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}