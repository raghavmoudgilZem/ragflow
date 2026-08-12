
using KnowledgeBase.Application.Common;
using KnowledgeBase.Application.DTOs.Dataset;
namespace KnowledgeBase.Application.Interfaces.Services;

public interface IKnowledgeBaseService
{
    Task<CreateDatasetResponse> CreateDatasetAsync(
        CreateDatasetRequest request,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken);

    Task<PagedResult<DatasetDto>> GetDatasetsAsync(
  GetDatasetsRequest request, Guid tenantId,
  CancellationToken cancellationToken = default);
    Task<GetDatasetByIdResponse> GetDatasetByIdAsync(
Guid id,
 Guid tenantId,
CancellationToken cancellationToken = default);
    Task<UpdateDatasetResponse> UpdateDatasetAsync(
    Guid id,
     Guid tenantId,
    Guid userId,
    UpdateDatasetRequest request,
    CancellationToken cancellationToken = default);
    Task DeleteDatasetAsync(
    Guid id,
    Guid tenantId,
    CancellationToken cancellationToken = default);
}