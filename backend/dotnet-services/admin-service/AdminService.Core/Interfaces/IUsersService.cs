using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Core.Interfaces;

public interface IUsersService
{
    Task<ApiResponse<PagedUserResponseDto>> GetUsersAsync(
        GetUsersRequestDto request,
        string? authorization,
        CancellationToken cancellationToken
    );

    Task<ApiResponse<UserEnableDisableDto>> EnableUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    );

    Task<ApiResponse<UserEnableDisableDto>> DisableUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    );

    Task<ApiResponse<UserDetailsDto>> GetUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    );

    Task<ApiResponse<List<UserTenantDto>>> GetUserTenantsAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    );
}
