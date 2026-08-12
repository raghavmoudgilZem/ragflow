using Document.Application.DTOs.Requests;
using Document.Application.DTOs.Responses;

namespace Document.Application.Interfaces.Services;

public interface IDocumentService
{
    Task<CreateDocumentResponse> CreateDocumentAsync(
        CreateDocumentRequest request,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default);
    Task<PagedResponse<GetDocumentResponse>> GetDocumentsAsync(
GetDocumentsRequest request,
Guid tenantId,
CancellationToken cancellationToken = default);

    Task<GetDocumentByIdResponse> GetDocumentByIdAsync(
    Guid documentId,
    Guid tenantId,
    CancellationToken cancellationToken = default);

    Task<UpdateDocumentResponse> UpdateDocumentAsync(
    Guid documentId,
    UpdateDocumentRequest request,
    Guid tenantId,
    Guid userId,
    CancellationToken cancellationToken = default);
    
    Task<ParseDocumentsResponse> ParseDocumentsAsync(
      ParseDocumentsRequest request,
      Guid tenantId,
      Guid userId,
      CancellationToken cancellationToken = default);

    Task<DeleteDocumentsResponse> DeleteDocumentsAsync(
    DeleteDocumentsRequest request,
    Guid tenantId,
    Guid userId,
    CancellationToken cancellationToken = default);
}