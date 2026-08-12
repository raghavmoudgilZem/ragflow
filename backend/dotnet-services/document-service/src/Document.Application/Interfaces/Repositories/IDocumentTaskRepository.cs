using Document.Domain.Entities;
using Document.Domain.Enums;

namespace Document.Application.Interfaces.Repositories;

public interface IDocumentTaskRepository
{
    Task AddAsync(
        DocumentTask task,
        CancellationToken cancellationToken = default);

    Task<DocumentTask?> GetByIdAsync(
        Guid taskId,
        CancellationToken cancellationToken = default);

    Task<List<DocumentTask>> GetByDocumentIdAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    Task<List<DocumentTask>> GetRunningTasksAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        DocumentTask task,
        CancellationToken cancellationToken = default);
    Task<bool> HasActiveParseTaskAsync(
Guid documentId,
CancellationToken cancellationToken = default);

    Task AddRangeAsync(
        IEnumerable<DocumentTask> tasks,
        CancellationToken cancellationToken = default);
    void DeleteTasks(
        IEnumerable<DocumentTask> tasks);

}