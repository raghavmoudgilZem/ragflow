using Document.Application.Interfaces.Repositories;
using Document.Domain.Entities;
using Document.Domain.Enums;
using Document.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using TaskStatus = Document.Domain.Enums.TaskStatus;

namespace Document.Infrastructure.Repositories;

public sealed class DocumentTaskRepository : IDocumentTaskRepository
{
    private readonly DocumentDbContext _context;

    public DocumentTaskRepository(DocumentDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        DocumentTask task,
        CancellationToken cancellationToken = default)
    {
        await _context.DocumentTasks.AddAsync(
            task,
            cancellationToken);
    }

    public async Task<DocumentTask?> GetByIdAsync(
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTasks
            .FirstOrDefaultAsync(
                x => x.Id == taskId,
                cancellationToken);
    }

    public async Task<List<DocumentTask>> GetByDocumentIdAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTasks
            .Where(x => x.DocumentId == documentId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<DocumentTask>> GetRunningTasksAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTasks
            .Where(x =>
                x.DocumentId == documentId &&
                x.Status == TaskStatus.Running)
            .ToListAsync(cancellationToken);
    }

    public Task UpdateAsync(
        DocumentTask task,
        CancellationToken cancellationToken = default)
    {
        _context.DocumentTasks.Update(task);

        return Task.CompletedTask;
    }
    public async Task<bool> HasActiveParseTaskAsync(
    Guid documentId,
    CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTasks.AnyAsync(x =>
            x.DocumentId == documentId &&
            x.TaskType == TaskType.Parse &&
            (
                x.Status == TaskStatus.Pending ||
                x.Status == TaskStatus.Running
            ),
            cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<DocumentTask> tasks, CancellationToken cancellationToken = default)
    {
        await _context.DocumentTasks.AddRangeAsync(
    tasks,
    cancellationToken);
    }
    public void DeleteTasks(
    IEnumerable<DocumentTask> tasks)
    {
        _context.DocumentTasks.RemoveRange(tasks);
    }
}