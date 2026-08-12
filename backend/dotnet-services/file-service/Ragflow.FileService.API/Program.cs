using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Ragflow.FileService.API.Extensions;
using Ragflow.FileService.API.Middlewares;
using Ragflow.FileService.API.Services;
using Ragflow.FileService.Core.Extensions;
using Ragflow.FileService.Core.Interfaces;
using Ragflow.FileService.Infrastructure.Extensions;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);


// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RAGFlow File Service API",
        Version = "v1",
        Description = "File Management Microservice"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Bearer token"
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] =
                new List<string>()
        });
});

// Health Checks
builder.Services.AddHealthChecks();

// CORS
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// Http Context
builder.Services.AddHttpContextAccessor();

// Current User Service
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Application Services
builder.Services.AddApiServices(builder.Configuration);

builder.Services.AddCoreServices();

builder.Services.AddInfrastructureServices(builder.Configuration);

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

#region JWT Configuration
var jwtSection = builder.Configuration.GetSection("Jwt");

var issuer =
    Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? jwtSection["Issuer"];


var audience =
    Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? jwtSection["Audience"];


var secret =
    (
        Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? jwtSection["Secret"]
    )?.Trim();


if (string.IsNullOrWhiteSpace(secret))
{
    throw new InvalidOperationException(
        "JWT Secret is not configured.");
}


builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;


        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var header =
                    context.Request.Headers["Authorization"]
                    .FirstOrDefault();


                Console.WriteLine(
                    $"Authorization Header: {header}"
                );


                if (!string.IsNullOrEmpty(header) &&
                    header.StartsWith("Bearer "))
                {
                    context.Token =
                        header["Bearer ".Length..];
                }


                Console.WriteLine(
                    $"Token Received: {context.Token != null}"
                );


                return Task.CompletedTask;
            },


            OnAuthenticationFailed = context =>
            {
                Console.WriteLine(
                    $"JWT Failed: {context.Exception.Message}"
                );

                return Task.CompletedTask;
            },


            OnTokenValidated = context =>
            {
                Console.WriteLine(
                    "JWT Validated Successfully"
                );

                return Task.CompletedTask;
            }
        };


        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidIssuer = issuer,


                ValidateAudience = true,

                ValidAudience = audience,


                ValidateLifetime = true,


                ValidateIssuerSigningKey = true,


                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(secret)
                    ),


                NameClaimType =
                    JwtRegisteredClaimNames.Sub,


                RoleClaimType =
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",


                ClockSkew = TimeSpan.Zero
            };
    });
#endregion



#region Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        "OwnerOnly",
        policy =>
            policy.RequireRole("Owner")
    );


    options.AddPolicy(
        "AdminOrOwner",
        policy =>
            policy.RequireRole(
                "Admin",
                "Owner")
    );


    options.AddPolicy(
        "MemberAccess",
        policy =>
            policy.RequireRole(
                "User",
                "Admin",
                "Owner")
    );
});
#endregion

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Exception Handling
app.UseMiddleware<ExceptionMiddleware>();

// CORS
app.UseCors("CorsPolicy");

// Authentication
app.UseAuthentication();

app.UseAuthorization();

// Endpoints
app.MapControllers();

app.MapHealthChecks("/health");

app.Run();