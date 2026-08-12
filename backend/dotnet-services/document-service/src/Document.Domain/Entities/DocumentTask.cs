
using Document.Domain.Common;
using Document.Domain.Enums;

namespace Document.Domain.Entities;

using TaskStatus = Enums.TaskStatus;

public sealed class DocumentTask : BaseEntity
{
    public Guid DocumentId { get; set; }

    public TaskType TaskType { get; set; }

    public TaskStatus Status { get; set; }

    public int Progress { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public Document Document { get; set; } = default!;
}