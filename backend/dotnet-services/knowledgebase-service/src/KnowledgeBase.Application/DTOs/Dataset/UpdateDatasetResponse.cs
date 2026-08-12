namespace KnowledgeBase.Application.DTOs.Dataset;

public sealed class UpdateDatasetResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public string Language { get; init; } = string.Empty;

    public string Permission { get; init; } = string.Empty;

    public string EmbeddingModel { get; init; } = string.Empty;

    public string ParserId { get; init; } = string.Empty;

    public string ChunkMethod { get; init; } = string.Empty;

    public DateTime UpdatedAt { get; init; }
}