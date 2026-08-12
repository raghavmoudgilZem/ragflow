using Document.Domain.Entities;

namespace Document.Application.Interfaces.Repositories;

public interface IFileDocumentRepository
{
    Task AddAsync(
        File2Document fileDocument,
        CancellationToken cancellationToken = default);

    Task<File2Document?> GetByDocumentIdAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        File2Document fileDocument,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        File2Document fileDocument,

CancellationToken cancellationToken = default);

    void DeleteFileMappings(
IEnumerable<File2Document> mappings);
}