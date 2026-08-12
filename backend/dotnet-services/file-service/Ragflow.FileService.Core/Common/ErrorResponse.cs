namespace Ragflow.FileService.Core.DTOs.Common;

public class ErrorResponse
{
    public bool Success { get; init; } = false;

    public string Message { get; init; } = string.Empty;

    public int StatusCode { get; init; }

    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
}