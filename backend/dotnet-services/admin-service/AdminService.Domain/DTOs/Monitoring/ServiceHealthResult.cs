using AdminService.Domain.DTOs.Monitoring;

namespace AdminService.Infrastructure.Services;

public class ServiceHealthResult
{
    public MonitoringServiceDto Service { get; set; } = new();

    public List<MonitoringDependencyDto> Dependencies { get; set; } = [];
}
