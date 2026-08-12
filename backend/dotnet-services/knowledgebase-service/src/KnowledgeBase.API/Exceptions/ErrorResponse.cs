namespace KnowledgeBase.API.Exceptions;

public sealed class ErrorResponse
{
    public int StatusCode { get; init; }

    public string Message { get; init; } = default!;

    public string? Details { get; init; }

    public string TraceId { get; init; } = default!;

    public DateTime Timestamp { get; init; }
}