namespace Ragflow.Identity.Application.DTOs;

public sealed class LogoutRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}