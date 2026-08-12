namespace Document.Application.DTOs.External;

public sealed class KnowledgeBaseDto
{
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Status { get; set; }

    public string EmbeddingModel { get; set; } = string.Empty;

    public int ChunkSize { get; set; }

    public int ChunkOverlap { get; set; }
}