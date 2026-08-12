using Microsoft.EntityFrameworkCore;
using File = Ragflow.FileService.Domain.Entities.File;

namespace Ragflow.FileService.Infrastructure.Persistence;

public class FileDbContext : DbContext
{
    public FileDbContext(DbContextOptions<FileDbContext> options)
        : base(options)
    {
    }


    public DbSet<File> Files { get; set; } = null!;
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FileDbContext).Assembly);
    }
}