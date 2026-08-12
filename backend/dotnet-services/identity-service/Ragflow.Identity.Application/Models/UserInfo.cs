

public sealed class UserInfo
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime? LastLoginAt { get; set; }

    // optional but useful in multi-tenant systems
    public List<UserTenants?> Tenants { get; set; } = new();
}



public sealed class UserTenants
{
    public Guid TenantId { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}