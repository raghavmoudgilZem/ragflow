using System.Text.Json;
using AdminService.Core.Interfaces;
using AdminService.Infrastructure;
using AdminService.Infrastructure.Services;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Ragflow.AdminService.API.Middlewares;
using Ragflow.AdminService.Domain.DTOs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});
builder.Services.AddHttpClient();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context
            .ModelState.Values.SelectMany(v => v.Errors)
            .Select(e =>
                string.IsNullOrWhiteSpace(e.ErrorMessage)
                    ? "One or more validation errors occurred."
                    : e.ErrorMessage
            )
            .ToList();

        return new BadRequestObjectResult(ApiResponse<object>.ErrorResponse(errors));
    };
});

// Register services
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context
            .ModelState.Values.SelectMany(v => v.Errors)
            .Select(e =>
                string.IsNullOrWhiteSpace(e.ErrorMessage)
                    ? "One or more validation errors occurred."
                    : e.ErrorMessage
            )
            .ToList();

        return new BadRequestObjectResult(ApiResponse<object>.ErrorResponse(errors));
    };
});

builder.Services.AddInfrastructure(builder.Configuration);

// custom services
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IMonitoringService, MonitoringService>();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Admin Service API", Version = "v1" });

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter: Bearer {your JWT token}",
        }
    );

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                Array.Empty<string>()
            },
        }
    );
});

builder.Configuration.AddJsonFile("config/services.json", optional: false, reloadOnChange: true);

var serviceUrls = builder.Configuration.GetSection("Services").GetChildren();

foreach (var service in serviceUrls)
{
    if (!string.IsNullOrWhiteSpace(service.Value))
    {
        builder.Services.AddHttpClient(
            service.Key,
            client =>
            {
                client.BaseAddress = new Uri(service.Value);
            }
        );
    }
}

#region Health Checks

builder.Services.AddHealthChecks();

#endregion


// Build app AFTER all services are registered
var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseMiddleware<GatewayClaimsMiddleware>();
app.UseMiddleware<OwnerOnlyMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

app.MapControllers();

app.MapHealthChecks("/health");

app.Run();
