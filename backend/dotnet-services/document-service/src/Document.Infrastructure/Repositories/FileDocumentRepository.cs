using Document.Application.Interfaces.Repositories;
using Document.Domain.Entities;
using Document.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Document.Infrastructure.Repositories;

public sealed class FileDocumentRepository : IFileDocumentRepository
{
    private readonly DocumentDbContext _context;

    public FileDocumentRepository(DocumentDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        File2Document fileDocument,
        CancellationToken cancellationToken = default)
    {
        await _context.FileDocuments.AddAsync(
            fileDocument,
            cancellationToken);
    }

    public async Task<File2Document?> GetByDocumentIdAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        return await _context.FileDocuments
            .FirstOrDefaultAsync(
                x => x.DocumentId == documentId,
                cancellationToken);
    }

    public Task DeleteAsync(
        File2Document fileDocument,
        CancellationToken cancellationToken = default)
    {
        _context.FileDocuments.Remove(fileDocument);

        return Task.CompletedTask;
    }
    public Task UpdateAsync(
       File2Document fileDocument,
       CancellationToken cancellationToken = default)
    {
        _context.FileDocuments.Update(fileDocument);

        return Task.CompletedTask;
    }
    public void DeleteFileMappings(
        IEnumerable<File2Document> mappings)
    {
        _context.FileDocuments.RemoveRange(mappings);
    }
}