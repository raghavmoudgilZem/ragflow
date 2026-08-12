public interface IEmailService
{
    Task SendInviteEmailAsync(
        string email,
        Guid tenantId,
        string invitedby,
        CancellationToken cancellationToken);
}