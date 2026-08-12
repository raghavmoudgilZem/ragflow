namespace KnowledgeBase.Application.DTOs.Dataset;

public sealed class DatasetDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public string Language { get; init; } = string.Empty;

    public string Permission { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}