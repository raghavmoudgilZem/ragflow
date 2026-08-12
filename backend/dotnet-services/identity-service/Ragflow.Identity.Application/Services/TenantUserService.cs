using Ragflow.Identity.Application.DTOs;
using Ragflow.Identity.Application.Events;
using Ragflow.Identity.Application.Interfaces;

public sealed class TenantUserService
    : ITenantUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUserTenantRepository _userTenantRepository;

    public TenantUserService(
        IUserTenantRepository userTenantRepository, IUserRepository userRepository)
    {
        _userTenantRepository =
            userTenantRepository;
        _userRepository =
            userRepository;

    }

    public async Task RemoveUserAsync(
        Guid tenantId,
        Guid currentUserId,
        RemoveTenantUserRequestDto request,
        CancellationToken cancellationToken)
    {
        //------------------------------------
        // Self Removal Allowed
        //------------------------------------

        var isSelfRemoval =
            currentUserId == request.UserId;

        //------------------------------------
        // Owner Check
        //------------------------------------

        if (!isSelfRemoval)
        {
            var membership =
                await _userTenantRepository
                    .GetTenantMembershipsAsync(
                        currentUserId,
                        tenantId,
                        cancellationToken);

            if (membership == null)
            {
                throw new UnauthorizedAccessException(
                    "Membership not found.");
            }

            if (membership.Role !=
                TenantRole.Owner.ToString())
            {
                throw new UnauthorizedAccessException(
                    "No authorization.");
            }
        }

        //------------------------------------
        // Remove User
        //------------------------------------

        await _userTenantRepository
            .RemoveUserFromTenantAsync(
                tenantId,
                request.UserId,
                cancellationToken);
    }
    public async Task<List<UserListItemDto>> GetTenantUsersAsync(
        Guid tenantId,
        Guid currentUserId,
        CancellationToken cancellationToken)
    {
        //------------------------------------
        // Authorization
        //------------------------------------



        //------------------------------------
        // Fetch Users
        //------------------------------------

        var users =
            await _userTenantRepository
                .GetUsersByTenantAsync(
                    tenantId,
                    cancellationToken);

        //------------------------------------
        // Delta Seconds
        //------------------------------------



        return users;
    }

    public async Task<InviteUserResponseDto> InviteUserAsync(
        Guid tenantId,
Guid currentUserId,
        InviteUserRequestDto request,
        CancellationToken cancellationToken)
    {
        // 1. find user by email
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        var currentuser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentuser == null)
            throw new Exception("currentuser not found.");
        if (user == null)
            throw new Exception("User not found.");

        // 2. check existing membership
        var existing = await _userTenantRepository.GetTenantMembershipsAsync(user.Id, tenantId, cancellationToken);

        if (existing != null)
        {
            if (existing.Role == TenantRole.Normal.ToString())
            {
                throw new Exception(
                    $"{request.Email} is already in the team.");
            }

            if (existing.Role == TenantRole.Owner.ToString())
            {
                throw new Exception(
                    $"{request.Email} is the owner of the team.");
            }

            if (existing.Role == TenantRole.Invite.ToString())
            {
                throw new Exception(
                    $"{request.Email} already has a pending invitation.");
            }

            throw new Exception(
                $"{request.Email} is in the team, but the role: {existing.Role} is invalid.");
        }
        //   var inviteduser = await _userRepository.GetByIdAsync(invitedBy, cancellationToken);

        await _userTenantRepository.AddAsync(new UserTenant
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TenantId = tenantId,
            Role = TenantRole.Invite.ToString(),
            Status = "Pending",
            InvitedBy = tenantId
        }, cancellationToken);



        return new InviteUserResponseDto
        {
            UserId = user.Id,
            Email = user.Email!
        };
    }

}