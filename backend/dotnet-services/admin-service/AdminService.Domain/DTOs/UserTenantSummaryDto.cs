namespace Ragflow.AdminService.Domain.DTOs;

public sealed class UserTenantSummaryDto
{
    public Guid TenantId { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime? AcceptedAt { get; set; }

    public string TenantName { get; set; } = string.Empty;
}
