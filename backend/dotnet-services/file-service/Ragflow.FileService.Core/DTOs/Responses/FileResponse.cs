using Ragflow.FileService.Domain.Entities;

namespace Ragflow.FileService.Core.DTOs.Responses;

public class FileResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public FileType Type { get; set; }

    public Guid? ParentId { get; set; }

    public string? Extension { get; set; }

    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    public string? StorageProvider { get; set; }

    public string? ObjectKey { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}