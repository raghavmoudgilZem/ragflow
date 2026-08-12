namespace Document.Domain.Entities;

public sealed class File2Document
{
    public Guid DocumentId { get; set; }

    public Guid FileId { get; set; }

    public Document Document { get; set; } = default!;
}