using System.Text.Json.Serialization;

namespace Ragflow.AdminService.Domain.DTOs;

public sealed class LogoutRequestDto
{
    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;
}
