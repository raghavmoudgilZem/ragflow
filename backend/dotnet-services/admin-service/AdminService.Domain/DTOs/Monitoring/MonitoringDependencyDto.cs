namespace AdminService.Domain.DTOs.Monitoring;

public class MonitoringDependencyDto
{
    public string Id { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int ResponseTime { get; set; }

    public string Version { get; set; } = string.Empty;
}
