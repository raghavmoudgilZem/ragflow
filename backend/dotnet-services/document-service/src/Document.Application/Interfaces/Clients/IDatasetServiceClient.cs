using Document.Application.DTOs.External;

namespace Document.Application.Interfaces.Clients;

public interface IDatasetServiceClient
{
    Task<KnowledgeBaseDto?> GetKnowledgeBaseAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        CancellationToken cancellationToken = default);
}