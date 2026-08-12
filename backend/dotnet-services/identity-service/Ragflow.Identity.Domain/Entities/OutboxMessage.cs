namespace Ragflow.Identity.Domain.Entities;

public sealed class OutboxMessage
{
    public Guid Id { get; set; }

    public Guid MessageId { get; set; }

    public Guid CorrelationId { get; set; }

    public string EventType { get; set; } = null!;

    public string Payload { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int RetryCount { get; set; }

    public DateTime CreatedOnUtc { get; set; }

    public DateTime? LastAttemptOnUtc { get; set; }

    public DateTime? ProcessedOnUtc { get; set; }

    public string? ErrorMessage { get; set; }

  
}