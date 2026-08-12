using Ragflow.Identity.Application.DTOs;

public interface ITenantUserService
{
    Task RemoveUserAsync(
        Guid tenantId,
        Guid currentUserId,
        RemoveTenantUserRequestDto request,
        CancellationToken cancellationToken);
    Task<List<UserListItemDto>> GetTenantUsersAsync(
Guid tenantId,
Guid currentUserId,
CancellationToken cancellationToken);
    Task<InviteUserResponseDto> InviteUserAsync(
          Guid tenantId,
         Guid currentUserId,
          InviteUserRequestDto request,
          CancellationToken cancellationToken);
}