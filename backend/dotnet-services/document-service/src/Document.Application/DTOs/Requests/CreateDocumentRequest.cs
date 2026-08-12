using Document.Application.DTOs.Common;


namespace Document.Application.DTOs.Requests;

public sealed class CreateDocumentRequest
{
    public Guid KnowledgeBaseId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string ParserId { get; set; } = "default";

    public bool ParseImmediately { get; set; }

    public FileUploadRequest File { get; set; } = default!;
}