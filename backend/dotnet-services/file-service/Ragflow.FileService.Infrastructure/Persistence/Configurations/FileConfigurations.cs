using File = Ragflow.FileService.Domain.Entities.File;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ragflow.FileService.Infrastructure.Persistence.Configurations;
public class FileConfiguration : IEntityTypeConfiguration<File>
{
    public void Configure(EntityTypeBuilder<File> builder)
    {
        builder.ToTable("Files");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Type)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Extension)
            .HasMaxLength(20);

        builder.Property(x => x.ContentType)
            .HasMaxLength(100);

        builder.Property(x => x.StorageProvider)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.BucketName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.ObjectKey)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.Property(x => x.CurrentVersion)
            .HasDefaultValue(1);

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false);

        builder.HasOne(x => x.ParentFolder)
            .WithMany(x => x.Children)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ParentId);
        builder.HasIndex(x => x.OwnerId);
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Name);
        builder.HasIndex(x => x.IsDeleted);
    }
}