using Document.Application.DTOs.Requests;
using Document.Application.DTOs.Responses;
using Document.Domain.Entities;

namespace Document.Application.Interfaces.Repositories;

using DocumentEntity = Document.Domain.Entities.Document;
using Task = System.Threading.Tasks.Task;

public interface IDocumentRepository
{
   

    Task<DocumentEntity?> GetByNameAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        string name,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        Guid id,
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
          DocumentEntity document,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        DocumentEntity document,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        DocumentEntity document,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<GetDocumentResponse>> GetDocumentsAsync(
      Guid tenantId,
      GetDocumentsRequest request,
      CancellationToken cancellationToken = default);

    Task<GetDocumentByIdResponse?> GetByIdAsync(
    Guid documentId,
    Guid tenantId,
    CancellationToken cancellationToken = default);
    
    Task<Domain.Entities.Document?> GetByIdForUpdateAsync(
    Guid documentId,
    Guid tenantId,
    CancellationToken cancellationToken = default);

    Task<bool> ExistsByNameAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        string name,
        Guid excludeDocumentId,
        CancellationToken cancellationToken = default);

    void Update(
        Domain.Entities.Document document);
    Task<List<Domain.Entities.Document>> GetByIdsAsync(
    IEnumerable<Guid> documentIds,
    Guid tenantId,
    CancellationToken cancellationToken = default);

    void UpdateRange(
        IEnumerable<Domain.Entities.Document> documents);
    Task AddRangeAsync(
    IEnumerable<Domain.Entities.DocumentTask> tasks,
    CancellationToken cancellationToken = default);


    void Delete(Domain.Entities.Document document);

    void DeleteRange(IEnumerable<Domain.Entities.Document> documents);
}