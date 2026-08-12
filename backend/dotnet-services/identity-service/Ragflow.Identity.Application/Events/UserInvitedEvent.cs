namespace Ragflow.Identity.Application.Events;

public sealed class UserInvitedEvent
{
    public Guid TenantId { get; set; }

    public Guid UserId { get; set; }

    public Guid InvitedBy { get; set; }

    public string Email { get; set; } = string.Empty;
}