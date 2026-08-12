using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendInviteEmailAsync(
        string email,
        Guid tenantId,
        string inviterName,
        CancellationToken cancellationToken)
    {
        var subject = "You've been invited";

        var body = $@"
Hello,

{inviterName} has invited you to join tenant {tenantId}.

Please click the link below to accept the invitation:

https://your-app-url.com/invitations/accept?tenantId={tenantId}

Regards,
RAGFlow Team
";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _settings.SenderName,
            _settings.SenderEmail));

        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = subject;

        message.Body = new TextPart("plain")
        {
            Text = body
        };

        using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            _settings.Host,
            _settings.Port,
            SecureSocketOptions.StartTls,
            cancellationToken);

        await smtp.AuthenticateAsync(
            _settings.Username,
            _settings.Password,
            cancellationToken);

        await smtp.SendAsync(message, cancellationToken);

        await smtp.DisconnectAsync(
            true,
            cancellationToken);
    }
}


public class EmailSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }

    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
}