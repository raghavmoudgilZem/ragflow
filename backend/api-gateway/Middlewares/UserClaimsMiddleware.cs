using System.Security.Claims;

namespace RAGFlow.ApiGateway.Middlewares;

public class UserClaimsMiddleware
{
    private readonly RequestDelegate _next;

    public UserClaimsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Sanitize (Anti-Spoofing)
        context.Request.Headers.Remove("X-User-Id");
        context.Request.Headers.Remove("X-User-Email");
        context.Request.Headers.Remove("X-User-Roles");
        context.Request.Headers.Remove("X-Tenant-Id");

        // 2. Extract and Inject if Authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirst("id")?.Value ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = context.User.FindFirst("email")?.Value ?? context.User.FindFirst(ClaimTypes.Email)?.Value;
            var roles = context.User.FindFirst("roles")?.Value ?? context.User.FindFirst(ClaimTypes.Role)?.Value;
            var tenantId = context.User.FindFirst("tenantId")?.Value
               ?? context.User.FindFirst("tenant_id")?.Value;
            if (!string.IsNullOrEmpty(userId)) context.Request.Headers["X-User-Id"] = userId;
            if (!string.IsNullOrEmpty(email)) context.Request.Headers["X-User-Email"] = email;
            if (!string.IsNullOrEmpty(roles)) context.Request.Headers["X-User-Roles"] = roles;
            if (!string.IsNullOrEmpty(tenantId)) context.Request.Headers["X-Tenant-Id"] = tenantId;
        }
        
        await _next(context);
    }
}