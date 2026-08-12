using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using CryptoExchange.API.Middleware;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using RabbitMQ.Client;
using Ragflow.Identity.Application.Interfaces;
using Ragflow.Identity.Application.Services;
using Ragflow.Identity.Infrastructure;
using Ragflow.Identity.Infrastructure.BackgroundServices;
using Ragflow.Identity.Infrastructure.Identity;
using Ragflow.Identity.Infrastructure.Persistence;
using Ragflow.Identity.Infrastructure.Repositories;
using Ragflow.Identity.Infrastructure.Security;
using Scalar.AspNetCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

#region Database

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("MySql");

    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 39)));
});

#endregion

#region Identity

builder
    .Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireDigit = true;
        options.Password.RequireNonAlphanumeric = true;

        options.User.RequireUniqueEmail = true;

        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);

        options.SignIn.RequireConfirmedEmail = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

#endregion

#region JWT

// Bind Jwt section to JwtOptions class
builder.Services.Configure<JwtOptions>(options =>
{
    builder.Configuration.GetSection("Jwt").Bind(options);

    options.Secret = (
        Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? options.Secret
    )?.Trim();

    options.Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? options.Issuer;

    options.Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? options.Audience;
});

Console.WriteLine("Environment: " + builder.Environment.EnvironmentName);

foreach (var kv in builder.Configuration.AsEnumerable())
{
    if (kv.Key.StartsWith("Jwt"))
    {
        Console.WriteLine($"{kv.Key} = {kv.Value}");
    }
}

var jwtSettings = builder.Configuration.GetSection("Jwt");

var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? jwtSettings["Issuer"];

var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? jwtSettings["Audience"];

var secret = (
    Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? jwtSettings["Secret"]
)?.Trim();

if (string.IsNullOrWhiteSpace(secret))
{
    throw new Exception("JWT secret key is missing.");
}

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = issuer,
            ValidAudience = audience,

            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),

            NameClaimType = JwtRegisteredClaimNames.Sub,

            RoleClaimType = ClaimTypes.Role,

            ClockSkew = TimeSpan.Zero,
        };
    });

#endregion

#region Authorization

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OwnerOnly", policy => policy.RequireRole("Owner"));

    options.AddPolicy("AdminOrOwner", policy => policy.RequireRole("Admin", "Owner"));

    options.AddPolicy("MemberAccess", policy => policy.RequireRole("User", "Admin", "Owner"));
});
#endregion


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

#region Dependency Injection

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IUserTenantRepository, UserTenantRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(builder.Configuration["Redis:ConnectionString"])
);
builder.Services.AddScoped<IRefreshTokenStore, RedisRefreshTokenStore>();
builder.Services.AddScoped<ITenantRepository, TenantRepository>();

// builder.Services.AddScoped<ITenantInvitationService, TenantInvitationService>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITenantUserService, TenantUserService>();
builder.Services.AddScoped<IOutboxRepository, OutboxRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddHostedService<OutboxPublisherBackgroundService>();

builder.Services.AddScoped<IUserService, UserService>();

#endregion

#region Controllers


#endregion

#region Swagger

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

#endregion

#region CORS

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

#endregion
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    });

#region Health Checks


var rabbitConnectionString =
    $"amqp://{rabbitConfig["Username"]}:{rabbitConfig["Password"]}@{rabbitConfig["Host"]}:5672";

builder
    .Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>(name: "mysql", failureStatus: HealthStatus.Unhealthy)
    .AddRedis(builder.Configuration["Redis:ConnectionString"]!, name: "redis")
    .AddRabbitMQ(
        sp =>
        {
            var factory = new ConnectionFactory
            {
                HostName = rabbitConfig["Host"],
                UserName = rabbitConfig["Username"],
                Password = rabbitConfig["Password"],
                Port = 5672,
            };

            return factory.CreateConnectionAsync().GetAwaiter().GetResult();
        },
        name: "rabbitmq"
    );

#endregion

var app = builder.Build();

#region Middleware
// app.UseMiddleware<ExceptionMiddleware>();
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

        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        dbContext.Database.Migrate();

        logger.LogInformation("Database migrations applied successfully.");
    }
}

app.UseHttpsRedirection();

app.UseCors("DefaultCorsPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks(
    "/health",
    new HealthCheckOptions
    {
        ResponseWriter = async (context, report) =>
        {
            var result = new
            {
                status = report.Status.ToString(),
                checks = report.Entries.Select(e => new
                {
                    name = e.Key,
                    status = e.Value.Status.ToString(),
                }),
            };

            context.Response.ContentType = "application/json";

            await context.Response.WriteAsync(JsonSerializer.Serialize(result));
        },
    }
);

#endregion
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

    string[] roles = { "Owner", "Admin", "User" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid> { Name = role });
        }
    }
}
app.Run();
