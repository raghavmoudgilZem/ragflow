using Microsoft.AspNetCore.Http;

public sealed class CreateDocumentApiRequest
{
    public Guid KnowledgeBaseId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string ParserId { get; set; } = "default";

    public bool ParseImmediately { get; set; }

    public IFormFile File { get; set; } = default!;
}