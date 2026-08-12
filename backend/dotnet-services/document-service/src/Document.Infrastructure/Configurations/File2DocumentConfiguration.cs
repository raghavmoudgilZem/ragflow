using Document.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Document.Infrastructure.Persistence.Configurations;

public sealed class File2DocumentConfiguration
    : IEntityTypeConfiguration<File2Document>
{
    public void Configure(EntityTypeBuilder<File2Document> builder)
    {
        builder.ToTable("file2document");

        builder.HasKey(x => new
        {
            x.DocumentId,
            x.FileId
        });

        builder.Property(x => x.DocumentId)
            .IsRequired();

        builder.Property(x => x.FileId)
            .IsRequired();

        builder.HasOne(x => x.Document)
            .WithMany(x => x.Files)
            .HasForeignKey(x => x.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.FileId);
    }
}