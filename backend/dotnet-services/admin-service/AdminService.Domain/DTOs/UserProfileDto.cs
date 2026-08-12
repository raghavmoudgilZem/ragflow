namespace Ragflow.AdminService.Domain.DTOs;

public sealed class UserProfileDto
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public List<string> Roles { get; set; } = [];
}
