namespace AdminService.Domain.DTOs.Monitoring;

public class MonitoringHealthResponseDto
{
    public string OverallStatus { get; set; } = string.Empty;

    public DateTime LastUpdated { get; set; }

    public MonitoringSummaryDto Summary { get; set; } = new();

    public List<MonitoringServiceDto> Services { get; set; } = [];

    public List<MonitoringDependencyDto> Dependencies { get; set; } = [];
}
