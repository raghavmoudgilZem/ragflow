using Microsoft.EntityFrameworkCore;

namespace Ragflow.Identity.Infrastructure.Repositories;

public sealed class TenantRepository
    : ITenantRepository
{
    private readonly ApplicationDbContext _context;

    public TenantRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        Tenant tenant,
        CancellationToken cancellationToken)
    {
        await _context.Tenants.AddAsync(
            tenant,
            cancellationToken);

        await _context.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<Tenant?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _context.Tenants
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }
}