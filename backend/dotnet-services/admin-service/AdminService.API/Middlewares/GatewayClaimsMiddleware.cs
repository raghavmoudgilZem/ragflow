using System.Security.Claims;
using Ragflow.AdminService.Domain.DTOs;

namespace Ragflow.AdminService.API.Middlewares;

public class GatewayClaimsMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GatewayClaimsMiddleware> _logger;

    public GatewayClaimsMiddleware(RequestDelegate next, ILogger<GatewayClaimsMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        _logger.LogDebug(
            "Processing request {Method} {Path}",
            context.Request.Method,
            context.Request.Path
        );

        // Allow anonymous login endpoint
        if (context.Request.Path.StartsWithSegments("/api/v1/auth"))
        {
            _logger.LogDebug(
                "Skipping gateway claims validation for anonymous endpoint {Path}",
                context.Request.Path
            );

            await _next(context);
            return;
        }

        var userId = context.Request.Headers["X-User-Id"].FirstOrDefault();
        var email = context.Request.Headers["X-User-Email"].FirstOrDefault();
        var role = context.Request.Headers["X-User-Roles"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning(
                "Request rejected. Missing X-User-Id header. Path: {Path}",
                context.Request.Path
            );

            context.Response.StatusCode = StatusCodes.Status401Unauthorized;

            await context.Response.WriteAsJsonAsync(
                ApiResponse<object>.ErrorResponse("Missing user identity from API Gateway.")
            );

            return;
        }

        _logger.LogInformation(
            "Authenticated gateway request. UserId: {UserId}, Email: {Email}, Role: {Role}",
            userId,
            email,
            role
        );

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Email, email ?? string.Empty),
            new Claim(ClaimTypes.Role, role ?? string.Empty),
        };

        context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Gateway"));

        await _next(context);

        _logger.LogDebug(
            "Completed request {Method} {Path} with status code {StatusCode}",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode
        );
    }
}
