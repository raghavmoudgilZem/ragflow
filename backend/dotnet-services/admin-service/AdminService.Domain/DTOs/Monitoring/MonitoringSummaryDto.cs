namespace AdminService.Domain.DTOs.Monitoring;

public class MonitoringSummaryDto
{
    public int TotalServices { get; set; }

    public int HealthyServices { get; set; }

    public int DegradedServices { get; set; }

    public int UnhealthyServices { get; set; }

    public int TotalDependencies { get; set; }

    public int HealthyDependencies { get; set; }
}
