using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using KnowledgeBase.Domain.Entities;

namespace KnowledgeBase.Infrastructure.Configurations;
using KnowledgeBaseEntity = KnowledgeBase.Domain.Entities.KnowledgeBase;
public class KnowledgeBaseConfiguration
    : IEntityTypeConfiguration<KnowledgeBaseEntity>
{
    public void Configure(EntityTypeBuilder<KnowledgeBaseEntity> builder)
    {
        builder.ToTable("knowledgebase");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
               .HasMaxLength(128)
               .IsRequired();

        builder.Property(x => x.Description)
               .HasMaxLength(1000);

        builder.Property(x => x.Language)
               .HasMaxLength(20);

        builder.Property(x => x.Permission)
               .HasMaxLength(20);

        builder.Property(x => x.EmbeddingModel)
               .HasMaxLength(100);

        builder.Property(x => x.ParserId)
               .HasMaxLength(50);

        builder.Property(x => x.ChunkMethod)
               .HasMaxLength(50);

        builder.Property(x => x.Status)
               .HasMaxLength(20);

        builder.Property(x => x.CreatedAt)
               .IsRequired();

        builder.HasIndex(x => new
        {
            x.TenantId,
            x.Name
        }).IsUnique();
    }
}