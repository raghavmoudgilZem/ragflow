using Ragflow.Identity.Domain.Entities;

namespace Ragflow.Identity.Application.Interfaces;

public interface IOutboxRepository
{
    Task AddAsync(
        OutboxMessage message,
        CancellationToken cancellationToken);

    Task<List<OutboxMessage>> GetPendingAsync(
        int batchSize,
        CancellationToken cancellationToken);

    Task UpdateAsync(
        OutboxMessage message,
        CancellationToken cancellationToken);
}