using System.Net;
using System.Text.Json;
using Ragflow.FileService.Core.DTOs.Common;
using Ragflow.FileService.Core.Exceptions;

namespace Ragflow.FileService.API.Middlewares;

public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);

            var (statusCode, message) = ex switch
            {
                BusinessException businessException =>
                    ((int)businessException.StatusCode, businessException.Message),

                UnauthorizedAccessException =>
                    (StatusCodes.Status401Unauthorized, "Authentication required."),

                _ =>
                    (StatusCodes.Status500InternalServerError, "Unexpected server error.")
            };

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = new ErrorResponse
            {
                Message = message,
                StatusCode = statusCode
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}