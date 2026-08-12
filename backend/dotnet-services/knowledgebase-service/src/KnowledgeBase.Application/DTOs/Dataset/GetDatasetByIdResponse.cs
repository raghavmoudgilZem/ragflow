namespace KnowledgeBase.Application.DTOs.Dataset;

public sealed class GetDatasetByIdResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public string Language { get; init; } = string.Empty;

    public string Permission { get; init; } = string.Empty;

    public string EmbeddingModel { get; init; } = string.Empty;

    public string ParserId { get; init; } = string.Empty;

    public string ChunkMethod { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public Guid CreatedBy { get; init; }

    public DateTime CreatedAt { get; init; }

    public Guid? UpdatedBy { get; init; }

    public DateTime? UpdatedAt { get; init; }
}