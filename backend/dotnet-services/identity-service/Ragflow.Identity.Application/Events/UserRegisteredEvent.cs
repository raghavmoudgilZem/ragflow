namespace Ragflow.Identity.Application.Events;

public sealed record UserRegisteredEvent
{
    public Guid MessageId { get; init; }

    public Guid CorrelationId { get; init; }

    public Guid UserId { get; init; }

    public string Email { get; init; } = string.Empty;

    public string UserName { get; init; } = string.Empty;

    public DateTime OccurredOnUtc { get; init; }
}