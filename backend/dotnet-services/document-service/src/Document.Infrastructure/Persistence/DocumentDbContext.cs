using Document.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Ragflow.Identity.Domain.Entities;

namespace Document.Infrastructure.Persistence;
using DocumentEntity = Document.Domain.Entities.Document;
public sealed class DocumentDbContext : DbContext
{
    public DocumentDbContext(DbContextOptions<DocumentDbContext> options)
        : base(options)
    {
    }

    public DbSet<DocumentEntity> Documents => Set<DocumentEntity>();

    public DbSet<File2Document> FileDocuments => Set<File2Document>();

    public DbSet<DocumentTask> DocumentTasks => Set<DocumentTask>();
    public DbSet<OutboxMessage> OutboxMessages =>
        Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DocumentDbContext).Assembly);
    }
}