using KnowledgeBase.Application.Common;
using KnowledgeBase.Application.DTOs.Dataset;
using KnowledgeBase.Domain.Entities;

namespace KnowledgeBase.Application.Interfaces.Repositories;

public interface IKnowledgeBaseRepository
{
    Task<bool> ExistsAsync(
        Guid tenantId,
        string name,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Domain.Entities.KnowledgeBase knowledgeBase,
        CancellationToken cancellationToken = default);

    Task<Domain.Entities.KnowledgeBase?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);
    Task<PagedResult<Domain.Entities.KnowledgeBase>> GetPagedAsync(
     Guid tenantId,
     GetDatasetsRequest request,
     CancellationToken cancellationToken = default);
    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);

    Task<Domain.Entities.KnowledgeBase?> GetByIdAsync(
Guid id,
Guid tenantId,
CancellationToken cancellationToken = default);
    void Remove(Domain.Entities.KnowledgeBase knowledgeBase);
}