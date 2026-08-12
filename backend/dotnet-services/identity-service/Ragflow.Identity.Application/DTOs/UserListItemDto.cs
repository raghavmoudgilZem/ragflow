namespace Ragflow.Identity.Application.DTOs;


public sealed class UserListItemDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int TenantCount { get; set; }

    public DateTime CreatedAt { get; set; }
}