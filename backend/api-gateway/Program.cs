using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using RAGFlow.ApiGateway.Extensions;
using RAGFlow.ApiGateway.Middlewares;
using RAGFlow.ApiGateway.Services;
using RAGFlow.ApiGateway.Workers;

var builder = WebApplication.CreateBuilder(args);

// 1. Add JWT Bearer Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");

var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? jwtSettings["Issuer"];

var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? jwtSettings["Audience"];

// We force .Trim() to destroy any invisible \r or spaces Docker tries to sneak in
var secretKey = (
    Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? jwtSettings["Secret"]
)?.Trim();

var keyBytes = Encoding.UTF8.GetBytes(secretKey!);

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            RequireSignedTokens = true,
        };
    });

// 2. Enforce Global Authorization
builder.Services.AddAuthorization(options =>
{
    // This policy applies to all routes unless explicitly overridden by YARP (e.g., "Anonymous")
    options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});

// Register Service Discovery
builder.Services.AddServiceDiscovery();

// Register YARP and attach the Service Discovery resolver
builder
    .Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddServiceDiscoveryDestinationResolver();

// RR-353 Rate Limiting Method Extension Service.
builder.Services.AddGatewayRateLimiting();

builder.Services.AddSingleton<IAuditLogQueue, AuditLogQueue>();

builder.Services.AddHostedService<AuditLogWorkerService>();

var app = builder.Build();

app.UseMiddleware<GlobalErrorMiddleware>();

app.UseMiddleware<RequestAuditLoggingMiddleware>();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

// RR-352 UserClaims Transformation Custom Middleware.
app.UseMiddleware<UserClaimsMiddleware>();

// Map the YARP routes
app.MapReverseProxy();

await app.RunAsync();
