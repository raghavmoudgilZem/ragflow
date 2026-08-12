using Microsoft.AspNetCore.Identity;

namespace Ragflow.Identity.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public UserStatus Status { get; set; } = UserStatus.Active;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    
}