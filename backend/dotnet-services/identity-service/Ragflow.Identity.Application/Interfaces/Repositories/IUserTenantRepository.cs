

using System.Security;
using Ragflow.Identity.Application.DTOs;

namespace Ragflow.Identity.Application.Interfaces;

public interface IUserTenantRepository
{
   Task<List<UserTenant?>> GetMembershipsAsync(
    Guid userId,

    CancellationToken cancellationToken);
   Task<UserTenant?> GetTenantMembershipsAsync(
Guid userId,
 Guid tenantId,
CancellationToken cancellationToken);

   Task<UserTenant?> GetDefaultMembershipAsync(
 Guid userId,
 CancellationToken cancellationToken);

   Task AddAsync(
UserTenant userTenant,
CancellationToken cancellationToken);
   Task RemoveUserFromTenantAsync(
   Guid tenantId,
   Guid userId,
   CancellationToken cancellationToken);
   Task<List<UserListItemDto>> GetUsersByTenantAsync(
Guid tenantId,
CancellationToken cancellationToken);

}