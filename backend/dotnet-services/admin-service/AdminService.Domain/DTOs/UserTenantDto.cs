using System.Text.Json.Serialization;

namespace Ragflow.AdminService.Domain.DTOs;

public sealed class UserTenantDto
{
    [JsonPropertyName("tenant_id")]
    public Guid TenantId { get; set; }

    [JsonPropertyName("tenant_name")]
    public string TenantName { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;
}
