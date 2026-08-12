using Microsoft.EntityFrameworkCore;
using KnowledgeBase.Application.Interfaces.Repositories;
using KnowledgeBase.Infrastructure.Persistence;
using KnowledgeBase.Application.Common;
using KnowledgeBase.Application.DTOs.Dataset;

namespace KnowledgeBase.Infrastructure.Repositories;

public sealed class KnowledgeBaseRepository
    : IKnowledgeBaseRepository
{
    private readonly KnowledgeBaseDbContext _context;

    public KnowledgeBaseRepository(
        KnowledgeBaseDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(
        Guid tenantId,
        string name,
        CancellationToken cancellationToken = default)
    {
        return await _context.KnowledgeBases
            .AnyAsync(x =>
                    x.TenantId == tenantId &&
                    x.Name == name,
                cancellationToken);
    }

    public async Task AddAsync(
        Domain.Entities.KnowledgeBase knowledgeBase,
        CancellationToken cancellationToken = default)
    {
        await _context.KnowledgeBases
            .AddAsync(knowledgeBase, cancellationToken);
    }

    public async Task<Domain.Entities.KnowledgeBase?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _context.KnowledgeBases
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<KnowledgeBase.Domain.Entities.KnowledgeBase>> GetPagedAsync(
       Guid tenantId,
       GetDatasetsRequest request,
       CancellationToken cancellationToken = default)
    {
        IQueryable<KnowledgeBase.Domain.Entities.KnowledgeBase> query =
            _context.KnowledgeBases.AsNoTracking();

        // Tenant Filter
        query = query.Where(x => x.TenantId == tenantId);

        // Search
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(x =>
                EF.Functions.Like(x.Name, $"%{search}%"));
        }

        // Sorting
        query = ApplySorting(query, request.SortBy, request.SortOrder);

        // Total Count
        var totalRecords = await query.CountAsync(cancellationToken);

        // Pagination
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<KnowledgeBase.Domain.Entities.KnowledgeBase>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalRecords = totalRecords
        };
    }
    private static IQueryable<KnowledgeBase.Domain.Entities.KnowledgeBase> ApplySorting(
       IQueryable<KnowledgeBase.Domain.Entities.KnowledgeBase> query,
       string sortBy,
       string sortOrder)
    {
        var isAscending = sortOrder.Equals(
            "asc",
            StringComparison.OrdinalIgnoreCase);

        return sortBy.ToLowerInvariant() switch
        {
            "name" => isAscending
                ? query.OrderBy(x => x.Name)
                : query.OrderByDescending(x => x.Name),

            "updatedat" => isAscending
                ? query.OrderBy(x => x.UpdatedAt)
                : query.OrderByDescending(x => x.UpdatedAt),

            _ => isAscending
                ? query.OrderBy(x => x.CreatedAt)
                : query.OrderByDescending(x => x.CreatedAt)
        };
    }
    public async Task<Domain.Entities.KnowledgeBase?> GetByIdAsync(
    Guid id,
    Guid tenantId,
    CancellationToken cancellationToken = default)
    {
        return await _context.KnowledgeBases
            // .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.TenantId == tenantId,
                cancellationToken);
    }
    public void Remove(Domain.Entities.KnowledgeBase knowledgeBase)
    {
        _context.KnowledgeBases.Remove(knowledgeBase);
    }
}