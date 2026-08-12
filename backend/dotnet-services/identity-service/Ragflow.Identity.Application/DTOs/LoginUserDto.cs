public sealed class LoginUserDto
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public List<string> Roles { get; set; } = [];
    public string? AccessToken { get; set; }

    public string? RefreshToken { get; set; }

    public int? ExpiresIn { get; set; }
}

public sealed class UserEnableDisableDto
{
    public Guid UserId { get; set; }

    public string Status { get; set; } = string.Empty;


}