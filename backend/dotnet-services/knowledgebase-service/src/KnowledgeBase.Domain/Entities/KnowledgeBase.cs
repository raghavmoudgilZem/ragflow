namespace KnowledgeBase.Domain.Entities;

public class KnowledgeBase
{
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Language { get; set; } = "English";

    public string Permission { get; set; } = "Me";

    public string EmbeddingModel { get; set; } = string.Empty;

    public string ParserId { get; set; } = string.Empty;

    public string ChunkMethod { get; set; } = "Recursive";

    public string Status { get; set; } = "Active";

    public Guid CreatedBy { get; set; }
     public Guid UpdatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}