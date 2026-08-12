namespace Document.Application.DTOs.Responses;

public sealed class CreateDocumentResponse
{
    public Guid DocumentId { get; set; }

    public Guid KnowledgeBaseId { get; set; }

    public Guid FileId { get; set; }

    public string Name { get; set; } = string.Empty;

    public bool ParsingStarted { get; set; }

    public Guid? TaskId { get; set; }

    public string Message { get; set; } = string.Empty;
}