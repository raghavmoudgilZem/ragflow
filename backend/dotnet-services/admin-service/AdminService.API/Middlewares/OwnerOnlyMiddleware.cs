using System.Security.Claims;
using Ragflow.AdminService.Domain.DTOs;

namespace Ragflow.AdminService.API.Middlewares;

public class OwnerOnlyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<OwnerOnlyMiddleware> _logger;

    public OwnerOnlyMiddleware(RequestDelegate next, ILogger<OwnerOnlyMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        _logger.LogDebug(
            "Authorizing request {Method} {Path}",
            context.Request.Method,
            context.Request.Path
        );

        // Allow anonymous login endpoint
        if (context.Request.Path.StartsWithSegments("/api/v1/auth"))
        {
            _logger.LogDebug(
                "Skipping owner authorization for anonymous endpoint {Path}",
                context.Request.Path
            );

            await _next(context);
            return;
        }

        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
        var role = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (!string.Equals(role, "Owner", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning(
                "Access denied. UserId: {UserId}, Email: {Email}, Role: {Role}, Path: {Path}",
                userId,
                email,
                role ?? "None",
                context.Request.Path
            );

            context.Response.StatusCode = StatusCodes.Status403Forbidden;

            await context.Response.WriteAsJsonAsync(
                ApiResponse<object>.ErrorResponse("Only Super Admin can access this resource.")
            );

            return;
        }

        _logger.LogInformation(
            "Owner authorization successful. UserId: {UserId}, Email: {Email}",
            userId,
            email
        );

        await _next(context);

        _logger.LogDebug(
            "Completed authorized request {Method} {Path} with status code {StatusCode}",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode
        );
    }
}
