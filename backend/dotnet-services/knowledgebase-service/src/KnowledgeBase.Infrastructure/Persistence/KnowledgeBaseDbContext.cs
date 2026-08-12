using Microsoft.EntityFrameworkCore;
using KnowledgeBase.Domain.Entities;

namespace KnowledgeBase.Infrastructure.Persistence;
using KnowledgeBaseEntity = KnowledgeBase.Domain.Entities.KnowledgeBase;
public class KnowledgeBaseDbContext : DbContext
{
    public KnowledgeBaseDbContext(
        DbContextOptions<KnowledgeBaseDbContext> options)
        : base(options)
    {
    }

    public DbSet<KnowledgeBaseEntity> KnowledgeBases => Set<KnowledgeBaseEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(KnowledgeBaseDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}