namespace KnowledgeBase.Application.DTOs.Dataset;

public sealed class UpdateDatasetRequest
{
    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public string Language { get; init; } = "English";

    public string Permission { get; init; } = "Me";

    public string EmbeddingModel { get; init; } = string.Empty;

    public string ParserId { get; init; } = string.Empty;

    public string ChunkMethod { get; init; } = string.Empty;
}