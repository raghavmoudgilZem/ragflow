using System.Text.Json;
using FluentValidation;
using Document.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace Document.API.Exceptions;

public sealed class GlobalExceptionHandler
    : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(
            exception,
            "Unhandled exception occurred.");

        var response = exception switch
        {
            ValidationException validation =>
                BuildResponse(
                    StatusCodes.Status400BadRequest,
                    "Validation failed.",
                    string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage)),
                    httpContext),

            DatasetNotFoundException =>
                BuildResponse(
                    StatusCodes.Status404NotFound,
                    exception.Message,
                    null,
                    httpContext),

            DuplicateDocumentException =>
                BuildResponse(
                    StatusCodes.Status409Conflict,
                    exception.Message,
                    null,
                    httpContext),

            UnauthorizedAccessException =>
                BuildResponse(
                    StatusCodes.Status401Unauthorized,
                    exception.Message,
                    null,
                    httpContext),

            _ =>
                BuildResponse(
                    StatusCodes.Status500InternalServerError,
                    "An unexpected error occurred.",
                    null,
                    httpContext)
        };

        httpContext.Response.StatusCode = response.StatusCode;

        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsync(
            JsonSerializer.Serialize(response),
            cancellationToken);

        return true;
    }

    private static ErrorResponse BuildResponse(
        int statusCode,
        string message,
        string? details,
        HttpContext context)
    {
        return new ErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Details = details,
            TraceId = context.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        };
    }
}