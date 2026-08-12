using Document.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

using Ragflow.Identity.Application.Interfaces;
using Ragflow.Identity.Domain.Common.Constants;
using Ragflow.Identity.Domain.Entities;

namespace Ragflow.Identity.Infrastructure.Repositories;

public sealed class OutboxRepository
    : IOutboxRepository
{
    private readonly DocumentDbContext _context;

    public OutboxRepository(
        DocumentDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        OutboxMessage message,
        CancellationToken cancellationToken)
    {
        await _context.OutboxMessages.AddAsync(
            message,
            cancellationToken);
    }

    public async Task<List<OutboxMessage>> GetPendingAsync(
        int batchSize,
        CancellationToken cancellationToken)
    {
        return await _context.OutboxMessages
            .Where(x =>
                x.Status == OutboxStatus.Pending)
            .OrderBy(x =>
                x.CreatedOnUtc)
            .Take(batchSize)
            .ToListAsync(cancellationToken);
    }

    public Task UpdateAsync(
        OutboxMessage message,
        CancellationToken cancellationToken)
    {
        _context.OutboxMessages.Update(message);

        return Task.CompletedTask;
    }
}