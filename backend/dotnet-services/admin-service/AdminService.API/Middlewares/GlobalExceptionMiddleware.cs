using System.Net;
using Ragflow.AdminService.Domain.DTOs;

namespace Ragflow.AdminService.API.Middlewares;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger
    )
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (HttpRequestException ex) when (ex.StatusCode.HasValue)
        {
            _logger.LogWarning(
                ex,
                "Downstream service returned {StatusCode} while processing {Method} {Path}",
                (int)ex.StatusCode.Value,
                context.Request.Method,
                context.Request.Path
            );

            if (context.Response.HasStarted)
            {
                _logger.LogWarning("Response already started. Cannot write error response.");
                throw;
            }

            context.Response.Clear();
            context.Response.StatusCode = (int)ex.StatusCode.Value;
            context.Response.ContentType = "application/json";

            var response = ApiResponse<object>.ErrorResponse(
                string.IsNullOrWhiteSpace(ex.Message) ? "Request failed." : ex.Message
            );

            await context.Response.WriteAsJsonAsync(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception while processing {Method} {Path}",
                context.Request.Method,
                context.Request.Path
            );

            if (context.Response.HasStarted)
            {
                _logger.LogWarning("Response already started. Unable to handle exception.");
                throw;
            }

            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var response = ApiResponse<object>.ErrorResponse(
                "An unexpected error occurred. Please try again later."
            );

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
