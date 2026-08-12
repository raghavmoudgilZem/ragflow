using Ragflow.FileService.Domain.Entities;

namespace Ragflow.FileService.Core.DTOs.Requests;

public class CreateFileRequest
{
    public string Name { get; set; } = string.Empty;

    public FileType Type { get; set; }

    public Guid? ParentId { get; set; }

    public string? Description { get; set; }
}