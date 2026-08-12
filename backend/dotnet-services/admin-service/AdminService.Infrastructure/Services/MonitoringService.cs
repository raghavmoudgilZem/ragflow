using System.Diagnostics;
using System.Linq;
using System.Net.Http.Json;
using AdminService.Core.Interfaces;
using AdminService.Domain.DTOs.Monitoring;
using Microsoft.Extensions.Configuration;
using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Infrastructure.Services;

public sealed class MonitoringService : IMonitoringService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public MonitoringService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<ApiResponse<MonitoringHealthResponseDto>> GetPlatformHealthAsync(
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        var configuredServices = _configuration.GetSection("Services").GetChildren().ToList();

        if (!configuredServices.Any())
        {
            return ApiResponse<MonitoringHealthResponseDto>.SuccessResponse(
                new MonitoringHealthResponseDto
                {
                    OverallStatus = "Unknown",
                    LastUpdated = DateTime.UtcNow,
                    Summary = new MonitoringSummaryDto(),
                    Services = [],
                    Dependencies = [],
                }
            );
        }

        var results = await Task.WhenAll(
            configuredServices.Select(service =>
                CheckServiceAsync(
                    service.Key,
                    service.Key.Replace("Service", " Service"),
                    $"{service.Value}/health",
                    cancellationToken
                )
            )
        );

        var services = results.Select(r => r.Service).ToList();

        var dependencies = results
            .SelectMany(r => r.Dependencies)
            .GroupBy(d => d.Id)
            .Select(g => g.First())
            .ToList();

        var healthyServices = services.Count(x => x.Status == "Healthy");
        var degradedServices = services.Count(x => x.Status == "Degraded");
        var unhealthyServices = services.Count(x => x.Status == "Unhealthy");

        var healthyDependencies = dependencies.Count(x => x.Status == "Healthy");

        var overallStatus =
            unhealthyServices > 0 ? "Unhealthy"
            : degradedServices > 0 ? "Degraded"
            : "Healthy";

        return ApiResponse<MonitoringHealthResponseDto>.SuccessResponse(
            new MonitoringHealthResponseDto
            {
                OverallStatus = overallStatus,
                LastUpdated = DateTime.UtcNow,

                Summary = new MonitoringSummaryDto
                {
                    TotalServices = services.Count,
                    HealthyServices = healthyServices,
                    DegradedServices = degradedServices,
                    UnhealthyServices = unhealthyServices,

                    TotalDependencies = dependencies.Count,
                    HealthyDependencies = healthyDependencies,
                },

                Services = services,
                Dependencies = dependencies,
            }
        );
    }

    private async Task<ServiceHealthResult> CheckServiceAsync(
        string id,
        string displayName,
        string url,
        CancellationToken cancellationToken
    )
    {
        var client = _httpClientFactory.CreateClient();

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await client.GetAsync(url, cancellationToken);

            stopwatch.Stop();

            var health = await response.Content.ReadFromJsonAsync<HealthResponse>();

            var service = new MonitoringServiceDto
            {
                Id = id,
                DisplayName = displayName,
                Category = "Microservice",
                Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy",
                ResponseTime = (int)stopwatch.ElapsedMilliseconds,
                Version = "Unknown",
            };

            var dependencies = new List<MonitoringDependencyDto>();

            if (health?.Checks != null)
            {
                foreach (var check in health.Checks)
                {
                    dependencies.Add(
                        new MonitoringDependencyDto
                        {
                            Id = check.Name.ToLower(),
                            DisplayName = check.Name,
                            Category = GetCategory(check.Name),
                            Status = check.Status,
                            ResponseTime = 0,
                            Version = "",
                        }
                    );
                }
            }

            return new ServiceHealthResult { Service = service, Dependencies = dependencies };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            return new ServiceHealthResult
            {
                Service = new MonitoringServiceDto
                {
                    Id = id,
                    DisplayName = displayName,
                    Category = "Microservice",
                    Status = "Unhealthy",
                    ResponseTime = (int)stopwatch.ElapsedMilliseconds,
                    Version = "Unknown",
                    Message = ex.Message,
                },
                Dependencies = [],
            };
        }
    }

    private static string GetCategory(string name)
    {
        return name.ToLower() switch
        {
            "mysql" => "Database",
            "redis" => "Cache",
            "rabbitmq" => "Message Broker",
            "minio" => "Object Storage",
            _ => "Infrastructure",
        };
    }
}
