namespace Ragflow.Identity.Application.DTOs;

public sealed class UserTenantDto
{
    public Guid TenantId { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime? AcceptedAt { get; set; }
    public string TenantName { get; set; } = string.Empty;
}