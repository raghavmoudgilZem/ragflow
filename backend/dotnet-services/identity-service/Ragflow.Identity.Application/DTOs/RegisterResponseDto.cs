public sealed class RegisterResponseDto
{
    public Guid UserId { get; set; }

    public string Email { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}