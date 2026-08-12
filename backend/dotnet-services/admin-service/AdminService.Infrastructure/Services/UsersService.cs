using AdminService.Core.Interfaces;
using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Infrastructure.Services;

public class UsersService : IUsersService
{
    private readonly IUsersApiClient _usersApiClient;

    public UsersService(IUsersApiClient usersApiClient)
    {
        _usersApiClient = usersApiClient;
    }

    public async Task<ApiResponse<PagedUserResponseDto>> GetUsersAsync(
        GetUsersRequestDto request,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        var result = await _usersApiClient.GetUsersAsync(request, authorization, cancellationToken);

        return result
            ?? ApiResponse<PagedUserResponseDto>.ErrorResponse("Failed to retrieve users.");
    }

    public async Task<ApiResponse<UserDetailsDto>> GetUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        var result = await _usersApiClient.GetUserAsync(userId, authorization, cancellationToken);

        return result
            ?? ApiResponse<UserDetailsDto>.ErrorResponse("Failed to retrieve user details.");
    }

    public async Task<ApiResponse<UserEnableDisableDto>> EnableUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        var result = await _usersApiClient.EnableUserAsync(
            userId,
            authorization,
            cancellationToken
        );

        return result ?? ApiResponse<UserEnableDisableDto>.ErrorResponse("Failed to enable user.");
    }

    public async Task<ApiResponse<UserEnableDisableDto>> DisableUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        var result = await _usersApiClient.DisableUserAsync(
            userId,
            authorization,
            cancellationToken
        );

        return result ?? ApiResponse<UserEnableDisableDto>.ErrorResponse("Failed to disable user.");
    }

    public async Task<ApiResponse<List<UserTenantDto>>> GetUserTenantsAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        var result = await _usersApiClient.GetUserTenantsAsync(
            userId,
            authorization,
            cancellationToken
        );

        return result
            ?? ApiResponse<List<UserTenantDto>>.ErrorResponse("Failed to retrieve user tenants.");
    }
}
