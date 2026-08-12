using Microsoft.EntityFrameworkCore;
using Ragflow.Identity.Application.DTOs;
using Ragflow.Identity.Application.Interfaces;


namespace Ragflow.Identity.Infrastructure.Repositories;

public sealed class UserTenantRepository
    : IUserTenantRepository
{
    private readonly ApplicationDbContext _dbContext;

    public UserTenantRepository(
        ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }


    public async Task<List<UserTenant>> GetMembershipsAsync(
  Guid userId,
  CancellationToken cancellationToken)
    {
        return await _dbContext.UserTenants
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<UserTenant?> GetDefaultMembershipAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {


        return await _dbContext.UserTenants
.FirstOrDefaultAsync(x =>
   x.UserId == userId &&
   x.Role == TenantRole.Owner.ToString(),
   cancellationToken);
    }
    public async Task AddAsync(
    UserTenant userTenant,
    CancellationToken cancellationToken)
    {
        await _dbContext.UserTenants.AddAsync(
            userTenant,
            cancellationToken);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<UserTenant?> GetTenantMembershipsAsync(Guid userId, Guid tenantId, CancellationToken cancellationToken)
    {
        return await _dbContext.UserTenants
         .FirstOrDefaultAsync(x =>
             x.UserId == userId &&
             x.TenantId == tenantId,
             cancellationToken);
    }

    public async Task RemoveUserFromTenantAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var membership =
            await _dbContext.UserTenants
                .FirstOrDefaultAsync(
                    x =>
                        x.TenantId == tenantId &&
                        x.UserId == userId,
                    cancellationToken);

        if (membership == null)
        {
            return;
        }

        _dbContext.UserTenants.Remove(
            membership);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }
    public async Task<List<UserListItemDto>> GetUsersByTenantAsync(
    Guid tenantId,
    CancellationToken cancellationToken)
    {

        return await (
    from ut in _dbContext.UserTenants
    join u in _dbContext.Users
        on ut.UserId equals u.Id
    where ut.TenantId == tenantId
          && ut.Status == UserStatus.Active.ToString()
          && ut.Role != TenantRole.Owner.ToString()
    select new UserListItemDto
    {
        Id = u.Id,
        Email = u.Email!,
        Name = u.UserName!,

      
    })
    .ToListAsync(cancellationToken);
    }

}