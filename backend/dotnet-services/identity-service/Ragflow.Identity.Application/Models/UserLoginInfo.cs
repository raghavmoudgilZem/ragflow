public sealed class UserLoginInfo
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public UserStatus Status { get; set; }
    public string username { get; set; } = string.Empty;
}