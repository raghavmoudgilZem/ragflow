using Document.Domain.Enums;

namespace Document.Application.IntegrationEvents;

public sealed class ParseDocumentRequestedEvent
{
    public Guid TaskId { get; set; }

    public Guid DocumentId { get; set; }

    public Guid TenantId { get; set; }

    public Guid UserId { get; set; }

    public TaskType TaskType { get; set; }

    public DateTime RequestedAt { get; set; }

    public Guid? FileId { get; set; }
    public Guid MessageId { get; set; }

    public Guid CorrelationId { get; set; }


}