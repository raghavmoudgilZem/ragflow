using Document.Application.DTOs.Requests;
using Document.Application.DTOs.Responses;
using Document.Application.Interfaces.Repositories;
using Document.Domain.Entities;
using Document.Domain.Enums;
using Document.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using DocumentEntity = Document.Domain.Entities.Document;
namespace Document.Infrastructure.Repositories;

public sealed class DocumentRepository : IDocumentRepository
{
    private readonly DocumentDbContext _context;

    public DocumentRepository(DocumentDbContext context)
    {
        _context = context;
    }



    public async Task<DocumentEntity?> GetByNameAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        string name,
        CancellationToken cancellationToken = default)
    {
        return await _context.Documents
            .FirstOrDefaultAsync(
                x => x.KnowledgeBaseId == knowledgeBaseId &&
                     x.TenantId == tenantId &&
                     x.Name == name,
                cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        Guid id,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Documents
            .AnyAsync(
                x => x.Id == id &&
                     x.TenantId == tenantId,
                cancellationToken);
    }

    public async Task AddAsync(
        DocumentEntity document,
        CancellationToken cancellationToken = default)
    {
        await _context.Documents.AddAsync(document, cancellationToken);
    }

    public Task UpdateAsync(
        DocumentEntity document,
        CancellationToken cancellationToken = default)
    {
        _context.Documents.Update(document);

        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        DocumentEntity document,
        CancellationToken cancellationToken = default)
    {
        _context.Documents.Remove(document);

        return Task.CompletedTask;
    }

    public async Task<PagedResponse<GetDocumentResponse>> GetDocumentsAsync(
       Guid tenantId,
       GetDocumentsRequest request,
       CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"tenantId: {tenantId}");
        var query = _context.Documents
            .AsNoTracking()
            .Where(x =>
                x.TenantId == tenantId &&
                x.KnowledgeBaseId == request.KnowledgeBaseId);

        // Search

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(x =>
                x.Name.Contains(request.Search));
        }

        // Status Filter

        if (request.Status.HasValue)
        {
            query = query.Where(x =>
                x.Status == request.Status.Value);
        }

        // Sorting

        query = ApplySorting(query, request);

        // Total Count

        var totalCount = await query.CountAsync(cancellationToken);

        // Pagination

        var documents = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new GetDocumentResponse
            {
                Id = x.Id,

                KnowledgeBaseId = x.KnowledgeBaseId,

                Name = x.Name,

                Description = x.Description,

                // ParserId = x.ParserId,
                ParserId = x.ParserType.ToString(),

                Status = x.Status,

                CreatedAt = x.CreatedAt,

                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResponse<GetDocumentResponse>
        {
            Items = documents,

            Page = request.Page,

            PageSize = request.PageSize,

            TotalCount = totalCount,

            TotalPages = (int)Math.Ceiling(
                totalCount / (double)request.PageSize)
        };
    }
    private static IQueryable<Domain.Entities.Document> ApplySorting(
        IQueryable<Domain.Entities.Document> query,
        GetDocumentsRequest request)
    {
        var descending =
            request.SortOrder.Equals(
                "desc",
                StringComparison.OrdinalIgnoreCase);

        return request.SortBy.ToLower() switch
        {
            "name" =>
                descending
                    ? query.OrderByDescending(x => x.Name)
                    : query.OrderBy(x => x.Name),

            "status" =>
                descending
                    ? query.OrderByDescending(x => x.Status)
                    : query.OrderBy(x => x.Status),

            "updatedat" =>
                descending
                    ? query.OrderByDescending(x => x.UpdatedAt)
                    : query.OrderBy(x => x.UpdatedAt),

            _ =>
                descending
                    ? query.OrderByDescending(x => x.CreatedAt)
                    : query.OrderBy(x => x.CreatedAt)
        };
    }
    public async Task<GetDocumentByIdResponse?> GetByIdAsync(
        Guid documentId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var result =
            from document in _context.Documents.AsNoTracking()

            join fileMapping in _context.FileDocuments.AsNoTracking()
                on document.Id equals fileMapping.DocumentId
                into mappings

            from mapping in mappings.DefaultIfEmpty()

            where document.Id == documentId
                  && document.TenantId == tenantId

            select new GetDocumentByIdResponse
            {
                Id = document.Id,

                KnowledgeBaseId = document.KnowledgeBaseId,

                Name = document.Name,

                Description = document.Description,

                ParserId = document.ParserType.ToString(),

                Status = document.Status,

                FileId = mapping != null
                    ? mapping.FileId
                    : null,

                CreatedAt = document.CreatedAt,

                UpdatedAt = document.UpdatedAt
            };

        return await result.FirstOrDefaultAsync(cancellationToken);
    }
    public async Task<Domain.Entities.Document?> GetByIdForUpdateAsync(
        Guid documentId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Documents
            .FirstOrDefaultAsync(
                x => x.Id == documentId &&
                     x.TenantId == tenantId,
                cancellationToken);
    }
    public async Task<bool> ExistsByNameAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        string name,
        Guid excludeDocumentId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Documents.AnyAsync(
            x =>
                x.KnowledgeBaseId == knowledgeBaseId &&
                x.TenantId == tenantId &&
                x.Name == name &&
                x.Id != excludeDocumentId,
            cancellationToken);
    }
    public void Update(
        Domain.Entities.Document document)
    {
        _context.Documents.Update(document);
    }
    public async Task<List<Domain.Entities.Document>> GetByIdsAsync(
        IEnumerable<Guid> documentIds,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Documents
            .Include(x => x.Files)
            .Include(x => x.Tasks)
            .Where(x =>
                documentIds.Contains(x.Id) &&
                x.TenantId == tenantId)
            .ToListAsync(cancellationToken);
    }
    public void UpdateRange(
        IEnumerable<Domain.Entities.Document> documents)
    {
        _context.Documents.UpdateRange(documents);
    }
    public async Task AddRangeAsync(
        IEnumerable<DocumentTask> tasks,
        CancellationToken cancellationToken = default)
    {
        await _context.DocumentTasks.AddRangeAsync(
            tasks,
            cancellationToken);
    }
    public void Delete(Domain.Entities.Document document)
    {
        _context.Documents.Remove(document);
    }
    public void DeleteRange(
        IEnumerable<Domain.Entities.Document> documents)
    {
        _context.Documents.RemoveRange(documents);
    }
}