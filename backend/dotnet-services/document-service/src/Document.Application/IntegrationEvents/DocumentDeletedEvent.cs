using MassTransit;

namespace Document.Application.IntegrationEvents;

public sealed class DocumentDeletedEvent : CorrelatedBy<Guid>
{
    public Guid MessageId { get; set; }

    public Guid CorrelationId { get; set; }

    public Guid DocumentId { get; set; }

    public Guid FileId { get; set; }

    public Guid TenantId { get; set; }

    public Guid UserId { get; set; }
}