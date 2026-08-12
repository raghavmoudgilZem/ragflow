namespace Document.API.Exceptions;

public sealed class ErrorResponse
{
    public int StatusCode { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? Details { get; set; }

    public string TraceId { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; }
}