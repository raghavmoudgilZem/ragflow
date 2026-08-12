public sealed class LoginResponseDto
{
    public string AccessToken { get; set; } = default!;

    public string RefreshToken { get; set; } = default!;

    public DateTime ExpiresAt { get; set; }
}