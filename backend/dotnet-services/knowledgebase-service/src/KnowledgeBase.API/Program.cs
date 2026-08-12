
using KnowledgeBase.Infrastructure.Persistence;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;


using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using KnowledgeBase.Application.Interfaces.Repositories;
using KnowledgeBase.Application.Interfaces.Services;
using KnowledgeBase.Application.Services;
using KnowledgeBase.Infrastructure;
using KnowledgeBase.Application.Validators;

using Scalar.AspNetCore;
using KnowledgeBase.Infrastructure.Repositories;

using FluentValidation;
using KnowledgeBase.API.Exceptions;



var builder = WebApplication.CreateBuilder(args);


builder.Services.AddOpenApi();
#region Database

builder.Services.AddDbContext<KnowledgeBaseDbContext>(options =>
{
    options.UseMySql(
        builder.Configuration.GetConnectionString("KnowledgeBaseDb"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("KnowledgeBaseDb"))
    );
});
builder.Services.AddScoped<IKnowledgeBaseRepository, KnowledgeBaseRepository>();
builder.Services.AddScoped<IKnowledgeBaseService, KnowledgeBaseService>();
builder.Services.AddValidatorsFromAssembly(typeof(CreateDatasetValidator).Assembly);
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "DefaultCorsPolicy",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    );
});
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    });

#endregion
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer(
        (document, context, cancellationToken) =>
        {
            // 1. Initialize components safely
            document.Components ??= new OpenApiComponents();

            // FIX: Match the expected interface dictionary type precisely
            document.Components.SecuritySchemes ??=
                new Dictionary<string, IOpenApiSecurityScheme>();

            // 2. Define the scheme configuration
            var securityScheme = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Enter your raw JWT token. Do NOT type 'Bearer ' before it.",
            };

            // Use TryAdd to prevent system crashes on internal hot-reloads
            document.Components.SecuritySchemes.TryAdd("Bearer", securityScheme);

            // 3. Setup global security requirements mapping
            document.Security ??= new List<OpenApiSecurityRequirement>();

            var securityRequirement = new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = [],
            };

            document.Security.Add(securityRequirement);

            return Task.CompletedTask;
        }
    );
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddProblemDetails();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options.WithOpenApiRoutePattern("/openapi/v1.json");
    });

    using (var scope = app.Services.CreateScope())
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Applying database migrations...");

        var dbContext = scope.ServiceProvider.GetRequiredService<KnowledgeBaseDbContext>();

        dbContext.Database.Migrate();

        logger.LogInformation("Database migrations applied successfully.");
    }
}

app.UseHttpsRedirection();



app.UseCors("DefaultCorsPolicy");
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.UseExceptionHandler();
app.MapControllers();

app.Run();


