using Document.Application.DTOs.External;

namespace Document.Application.Interfaces.Clients;

public interface IParsingServiceClient
{
    Task StartParsingAsync(
        Guid documentId,
        Guid datasetId,
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task StopParsingAsync(
        Guid documentId,
        Guid tenantId,
        CancellationToken cancellationToken = default);
}