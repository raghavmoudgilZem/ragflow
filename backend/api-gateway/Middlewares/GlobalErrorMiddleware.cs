using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.WebUtilities;

namespace RAGFlow.ApiGateway.Middlewares;

public class GlobalErrorMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalErrorMiddleware> _logger;

    public GlobalErrorMiddleware(RequestDelegate next, ILogger<GlobalErrorMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var originalBodyStream = context.Response.Body;
        using var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred in the API Gateway.");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        }
        finally
        {
            if (context.Response.StatusCode >= 400)
            {
                memoryStream.Seek(0, SeekOrigin.Begin);
                var rawDownstreamBody = await new StreamReader(memoryStream).ReadToEndAsync();

                var problemDetails = new
                {
                    status_code = context.Response.StatusCode,
                    title = ReasonPhrases.GetReasonPhrase(context.Response.StatusCode),
                    detail = ExtractUniversalError(rawDownstreamBody),
                    trace_id = context.TraceIdentifier
                };

                // 4. Erase the downstream chaos, re-apply the status, and write the JSON
                context.Response.Clear();
                context.Response.StatusCode = problemDetails.status_code;
                context.Response.ContentType = "application/problem+json";
                
                var jsonBytes = JsonSerializer.SerializeToUtf8Bytes(problemDetails);
                await originalBodyStream.WriteAsync(jsonBytes);
            }
            else
            {
                memoryStream.Seek(0, SeekOrigin.Begin);
                await memoryStream.CopyToAsync(originalBodyStream);
            }

            context.Response.Body = originalBodyStream;
        }
    }

    // --- THE UNIVERSAL EXTRACTOR ---
    private static string ExtractUniversalError(string rawBody)
    {
        if (string.IsNullOrWhiteSpace(rawBody))
            return "An error occurred while processing the request.";

        try
        {
            // 1. THE FAST PATH (JSON Strategy)
            using var jsonDoc = JsonDocument.Parse(rawBody);
            var root = jsonDoc.RootElement;

            // Highly readable explicit ladder for modern microservices
            if (root.TryGetProperty("message", out var msg) && msg.ValueKind == JsonValueKind.String)
                return msg.GetString()!;
            else if (root.TryGetProperty("error", out var err) && err.ValueKind == JsonValueKind.String)
                return err.GetString()!;
            else if (root.TryGetProperty("detail", out var det) && det.ValueKind == JsonValueKind.String)
                return det.GetString()!;
            
            return "Downstream service failed with an unrecognized JSON schema.";
        }
        catch (JsonException)
        {
            // 2. THE MULTI-LANGUAGE SANITIZER (HTML / XML / Plain Text Strategy)
            
            // Step A: Strip all HTML/XML markup tags completely
            var noTags = Regex.Replace(rawBody, "<.*?>", string.Empty);
            
            // Step B: .NET, Java, and Node.js Fingerprint
            // Hunts for "[Something]Exception: " and captures everything until the end of the line.
            var commonTrace = Regex.Match(noTags, @"(?:[a-zA-Z0-9_.]*(?:Exception|Error)):\s*([^\r\n]+)", RegexOptions.IgnoreCase);
            if (commonTrace.Success && !string.IsNullOrWhiteSpace(commonTrace.Groups[1].Value))
            {
                var fullMessage = commonTrace.Groups[1].Value.Trim();
                
                // THE CLEANER: Split by comma and grab ONLY the first error to fix backend "string.Join" laziness
                var firstError = fullMessage.Split(new[] { ".,", "," }, StringSplitOptions.RemoveEmptyEntries).First().Trim();
                
                // Strip trailing periods for a perfectly clean UI sentence
                return firstError.TrimEnd('.');
            }

            // Step C: Python Fingerprint
            // Hunts for the LAST line containing "[Something]Error: <message>"
            var pythonTrace = Regex.Match(noTags, @"(?:[a-zA-Z0-9_]*(?:Error|Exception)):\s*(.*)$", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            if (pythonTrace.Success && !string.IsNullOrWhiteSpace(pythonTrace.Groups[1].Value))
            {
                return pythonTrace.Groups[1].Value.Trim();
            }

            // Step D: The Absolute Fallback
            // If the error doesn't match any known language fingerprint, squash spaces and safely truncate.
            var cleanText = Regex.Replace(noTags, @"\s+", " ").Trim();
            return cleanText.Length > 200 
                ? cleanText.Substring(0, 200) + "..." 
                : cleanText;
        }
    }
}