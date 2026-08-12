namespace Ragflow.Identity.Application.DTOs;

public sealed class UserDetailsDto
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public List<string> Roles { get; set; } = [];
}