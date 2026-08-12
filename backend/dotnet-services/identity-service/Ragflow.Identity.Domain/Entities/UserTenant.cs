public class UserTenant
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid TenantId { get; set; }

    public string Role { get; set; } = string.Empty;

    public Guid InvitedBy { get; set; }

    public string Status { get; set; } = "Valid";

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public DateTime? AcceptedAt { get; set; }
    
    public Tenant Tenant { get; set; }
}