using System.ComponentModel.DataAnnotations;

namespace KnowledgeBase.Application.DTOs.Dataset;

public sealed class CreateDatasetRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Language { get; set; } = "English";

    public string Permission { get; set; } = "Me";

    public string EmbeddingModel { get; set; } = string.Empty;

    public string ParserId { get; set; } = string.Empty;

    public string ChunkMethod { get; set; } = "Recursive";
}