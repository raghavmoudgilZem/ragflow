namespace Ragflow.FileService.Core.DTOs.Requests;

public class UpdateFileRequest
{
    public string? Description { get; set; }

    public Guid? ParentId { get; set; }
}