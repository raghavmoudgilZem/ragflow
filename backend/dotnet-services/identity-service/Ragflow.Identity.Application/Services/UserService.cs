using Ragflow.Identity.Application.DTOs;
using Ragflow.Identity.Application.Interfaces;

public sealed class UserService
    : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(
        IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<PagedUserResponseDto>>
        GetUsersAsync(
            GetUsersRequestDto request,
            CancellationToken cancellationToken)
    {
        if (request.Page <= 0)
        {
            throw new Exception(
                "Invalid pagination parameters.");
        }

        if (request.PageSize <= 0 ||
            request.PageSize > 100)
        {
            throw new Exception(
                "Invalid pagination parameters.");
        }

        return await _userRepository
            .GetUsersAsync(
                request,
                cancellationToken);
    }
    public async Task<ApiResponse<UserDetailsDto?>> GetUserAsync(
       Guid userId,
       CancellationToken cancellationToken)
    {
        var user =
            await _userRepository
                .GetUserDetailsAsync(
                    userId,
                    cancellationToken);

        if (user == null)
            throw new Exception("User not found");

        return user;
    }

    public Task<ApiResponse<UserEnableDisableDto?>> DisableUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return _userRepository
            .DisableUserAsync(
                userId,
                cancellationToken);
    }

    public Task<ApiResponse<UserEnableDisableDto?>> EnableUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return _userRepository
            .EnableUserAsync(
                userId,
                cancellationToken);
    }

    public Task<ApiResponse<List<UserTenantDto>>>
        GetUserTenantsAsync(
            Guid userId,
            CancellationToken cancellationToken)
    {
        return _userRepository
            .GetUserTenantsAsync(
                userId,
                cancellationToken);
    }


}