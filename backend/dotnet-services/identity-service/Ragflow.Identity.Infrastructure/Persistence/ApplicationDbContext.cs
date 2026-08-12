using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Ragflow.Identity.Domain.Entities;

using Ragflow.Identity.Infrastructure.Identity;

public sealed class ApplicationDbContext
    : IdentityDbContext<
        ApplicationUser,
        IdentityRole<Guid>,
        Guid>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<UserTenant> UserTenants => Set<UserTenant>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Tenant> Tenants => Set<Tenant>();

    public DbSet<OutboxMessage> OutboxMessages =>
        Set<OutboxMessage>();
    protected override void OnModelCreating(
        ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);

        builder.Entity<UserTenant>()
.HasOne(ut => ut.Tenant)
.WithMany(t => t.UserTenants)
.HasForeignKey(ut => ut.TenantId)
.OnDelete(DeleteBehavior.Cascade);
    }
}