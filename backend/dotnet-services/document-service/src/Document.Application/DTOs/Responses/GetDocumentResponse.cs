using Document.Domain.Enums;

namespace Document.Application.DTOs.Responses;

public sealed class GetDocumentResponse
{
    public Guid Id { get; set; }

    public Guid KnowledgeBaseId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string ParserId { get; set; } = string.Empty;

    public DocumentStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}