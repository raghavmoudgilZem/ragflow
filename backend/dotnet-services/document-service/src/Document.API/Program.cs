using Document.Application.Validators;
using Document.Infrastructure.Persistence;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

using Document.Infrastructure;
using System.Text.Json;
using Document.API.Exceptions;
using Document.Application;
using Ragflow.Identity.Infrastructure.BackgroundServices;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<DocumentDbContext>(options =>
{
    options.UseMySql(
        builder.Configuration.GetConnectionString("DocumentDb"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("DocumentDb")));
});
builder.Services.Configure<OutboxSettings>(
    builder.Configuration.GetSection("OutboxSettings"));
builder.Services.Configure<DatasetServiceSettings>(
builder.Configuration.GetSection("Services:DatasetService"));

builder.Services.Configure<FileServiceSettings>(
    builder.Configuration.GetSection("Services:FileService"));

builder.Services.Configure<ParsingServiceSettings>(
    builder.Configuration.GetSection("Services:ParsingService"));
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
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    });
builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddValidatorsFromAssemblyContaining<CreateDocumentValidator>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddProblemDetails();

builder.Services.AddOpenApi();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<OutboxPublisherBackgroundService>();
builder.Services.AddEndpointsApiExplorer();

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
var rabbitConfig = builder.Configuration.GetSection("RabbitMq");
Console.WriteLine($"Host: {rabbitConfig["Host"]}");
Console.WriteLine($"User: {rabbitConfig["Username"]}");
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq(
        (context, cfg) =>
        {
            cfg.Host(
                rabbitConfig["Host"],
                "/",
                h =>
                {
                    h.Username(rabbitConfig["Username"]);
                    h.Password(rabbitConfig["Password"]);
                }
            );
        }
    );
});
var app = builder.Build();


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

        var dbContext = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();

        dbContext.Database.Migrate();

        logger.LogInformation("Database migrations applied successfully.");
    }
}

app.UseHttpsRedirection();

app.UseCors("DefaultCorsPolicy");
app.MapControllers();
app.Run();


