namespace AdminService.Infrastructure.Services;

public class HealthResponse
{
    public string Status { get; set; } = string.Empty;

    public List<HealthCheckItem> Checks { get; set; } = [];
}

public class HealthCheckItem
{
    public string Name { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}
