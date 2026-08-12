using Document.Domain.Common;
using Document.Domain.Enums;

namespace Document.Domain.Entities;

public sealed class Document : BaseEntity
{
    public Guid KnowledgeBaseId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DocumentStatus Status { get; set; }

    public ParserType ParserType { get; set; }

    public bool ParseImmediately { get; set; }

    public ICollection<File2Document> Files { get; set; }
        = new List<File2Document>();

    public ICollection<DocumentTask> Tasks { get; set; }
        = new List<DocumentTask>();
}