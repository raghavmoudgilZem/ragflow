using System.Security.Claims;
using System.Threading.RateLimiting;

namespace RAGFlow.ApiGateway.Extensions;

public static class RateLimiterExtensions
{
    // The "this IServiceCollection" makes it an extension method!
    public static IServiceCollection AddGatewayRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // STANDARD POLICY
            options.AddPolicy("StandardPolicy", context =>
            {
                var userId = context.User.FindFirst("id")?.Value 
                             ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                             
                var ipAddress = context.Connection.RemoteIpAddress?.ToString();
                
                // CRITICAL FIX: Added the fallback back in so it doesn't crash on null!
                var partitionKey = userId ?? ipAddress ?? "unknown-client";

                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ =>
                    new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    });
            });

            // STRICT POLICY
            options.AddPolicy("StrictPolicy", context =>
            {
                var xffHeader = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                
                // CRITICAL FIX: Added the fallback back in here too!
                var ipAddress = !string.IsNullOrEmpty(xffHeader)
                    ? xffHeader.Split(',')[0].Trim() 
                    : context.Connection.RemoteIpAddress?.ToString() ?? "unknown-client";

                return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ =>
                    new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    });
            });
        });

        return services;
    }
}