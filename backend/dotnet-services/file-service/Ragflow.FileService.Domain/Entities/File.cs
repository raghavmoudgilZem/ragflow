using Ragflow.FileService.Domain.Common;

namespace Ragflow.FileService.Domain.Entities;

public class File : AuditableEntity
{

    public Guid? ParentId { get; set; }

    public string Name { get; set; } = string.Empty;

    public FileType Type { get; set; }

    public string? Extension { get; set; }

    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    public string StorageProvider { get; set; } = string.Empty;

    public string BucketName { get; set; } = string.Empty;

    public string ObjectKey { get; set; } = string.Empty;

    public int CurrentVersion { get; set; } = 1;

    public string? Description { get; set; }

    public File? ParentFolder { get; set; }

    public ICollection<File> Children { get; set; } = new List<File>();
}