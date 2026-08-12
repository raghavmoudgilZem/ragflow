using System.Text.Json.Serialization;

namespace Ragflow.AdminService.Domain.DTOs;

public sealed class RefreshTokenRequestDto
{
    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;
}
