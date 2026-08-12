using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using RAGFlow.ApiGateway.Models;
using RAGFlow.ApiGateway.Services;
using Yarp.ReverseProxy.Model;
using Yarp.ReverseProxy.Forwarder;

namespace RAGFlow.ApiGateway.Middlewares
{
    public class RequestAuditLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IAuditLogQueue _auditQueue;

        public RequestAuditLoggingMiddleware(RequestDelegate next, IAuditLogQueue auditQueue)
        {
            _next = next;
            _auditQueue = auditQueue;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();

            // 1. Session tracking with safe fallbacks
            var sessionId = context.Request.Headers["X-Session-Id"].FirstOrDefault()
                            ?? context.Items["SessionId"]?.ToString()
                            ?? context.TraceIdentifier;

            context.Items["SessionId"] = sessionId;
            if (!context.Request.Headers.ContainsKey("X-Session-Id"))
            {
                context.Request.Headers["X-Session-Id"] = sessionId;
            }

            Exception? pipelineException = null;

            try
            {
                // 2. Execute pipeline (Zero stream buffering!)
                await _next(context);
            }
            catch (Exception ex)
            {
                // Capture uncaught Gateway exceptions if they bubble up this far
                pipelineException = ex;
                throw;
            }
            finally
            {
                stopwatch.Stop();

                // 3. Extract YARP routing metadata to see where traffic went
                var proxyFeature = context.Features.Get<IReverseProxyFeature>();
                var downstreamCluster = proxyFeature?.Route?.Config?.ClusterId ?? "Unrouted";

                // 4. Architecturally sound error extraction
                ExtractErrorDetails(context, pipelineException, out var errorType, out var errorMessage);

                // 5. Build the fully structured Audit Payload
                var logEvent = new AuditLogEvent
                {
                    Level = context.Response.StatusCode >= 400 ? "ERROR" : "INFO",
                    TraceId = context.TraceIdentifier,
                    SpanId = Activity.Current?.SpanId.ToString() ?? "N/A",

                    SystemContext = new SystemContext
                    {
                        ServiceName = "ragflow-api-gateway",
                        Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                        HostName = Environment.MachineName
                    },

                    UserContext = new UserContext
                    {
                        UserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "Anonymous",
                        TenantId = context.User.FindFirst("tenant_id")?.Value ?? context.User.FindFirst("tenantId")?.Value ?? "N/A",
                        SessionId = sessionId,
                        ClientIp = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                        UserAgent = context.Request.Headers["User-Agent"].ToString() ?? "Unknown"
                    },

                    RequestDetails = new RequestDetails
                    {
                        Method = context.Request.Method,
                        Path = context.Request.Path,
                        QueryString = context.Request.QueryString.ToString(),
                        TargetService = downstreamCluster
                    },

                    ResponseDetails = new ResponseDetails
                    {
                        StatusCode = context.Response.StatusCode,
                        DurationMs = stopwatch.ElapsedMilliseconds,
                        ErrorType = errorType,
                        ErrorMessage = errorMessage
                    }
                };

                // 6. Non-blocking queue write (Zero latency added to user request)
                await _auditQueue.WriteAsync(logEvent);
            }
        }

        // The exact logic for safely extracting errors without stream buffering
        private static void ExtractErrorDetails(HttpContext context, Exception caughtException, out string? type, out string? message)
        {
            type = null;
            message = null;

            // If it's a successful request, we don't need error details
            if (context.Response.StatusCode < 400) return;

            // Scenario 1: YARP failed to proxy the request (e.g., target container is offline)
            var yarpError = context.Features.Get<IForwarderErrorFeature>();
            if (yarpError != null)
            {
                type = $"YarpProxyError_{yarpError.Error}";
                message = yarpError.Exception?.Message ?? "Reverse proxy forwarding failed.";
                return;
            }

            // Scenario 2: A C# exception occurred in our Gateway middleware
            var actualException = caughtException ?? context.Features.Get<IExceptionHandlerFeature>()?.Error;
            if (actualException != null)
            {
                type = actualException.GetType().Name;
                message = actualException.Message;
                return;
            }

            // Scenario 3: Gateway Auth Errors
            if (context.Response.StatusCode == 401 || context.Response.StatusCode == 403)
            {
                type = $"GatewayAuthError_{context.Response.StatusCode}";
                message = "Gateway rejected request: Authentication/Authorization failure.";
                return;
            }

            // Scenario 4: Downstream service returned a 400/500, but no C# exception was thrown
            type = $"HTTP_{context.Response.StatusCode}";
            message = "Target service returned an error status code.";
        }
    }
}