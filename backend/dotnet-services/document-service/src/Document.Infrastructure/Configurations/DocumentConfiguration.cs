using Document.Domain.Constants;
using Document.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DocumentEntity = Document.Domain.Entities.Document;
namespace Document.Infrastructure.Persistence.Configurations;
 
public sealed class DocumentConfiguration
    : IEntityTypeConfiguration<DocumentEntity>
{
    public void Configure(EntityTypeBuilder<DocumentEntity> builder)
    {
        builder.ToTable("document");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .IsRequired();

        builder.Property(x => x.KnowledgeBaseId)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(DocumentConstants.MaxNameLength)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(DocumentConstants.MaxDescriptionLength);

        builder.Property(x => x.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.ParserType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.ParseImmediately)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.CreatedBy)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);

        builder.Property(x => x.UpdatedBy);

        builder.HasIndex(x => new
        {
            x.TenantId,
            x.KnowledgeBaseId,
            x.Name
        }).IsUnique();

        builder.HasMany(x => x.Files)
            .WithOne(x => x.Document)
            .HasForeignKey(x => x.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Tasks)
            .WithOne(x => x.Document)
            .HasForeignKey(x => x.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}