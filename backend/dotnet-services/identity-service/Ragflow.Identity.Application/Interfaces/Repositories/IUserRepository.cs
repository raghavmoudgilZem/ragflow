// using Ragflow.Identity.Application.Models;

using Ragflow.Identity.Application.DTOs;
using Ragflow.Identity.Application.Services;

namespace Ragflow.Identity.Application.Interfaces;

public interface IUserRepository
{
    Task<UserLoginInfo?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken);

    Task<bool> CheckPasswordAsync(
        Guid userId,
        string password);

    Task UpdateLastLoginAsync(
        Guid userId,
        DateTime loginTime,
        CancellationToken cancellationToken);

    Task<UserLoginInfo?> GetByIdAsync(
        Guid userId,
        CancellationToken cancellationToken);
    Task CreateAsync(
CreateUserRequest request,
CancellationToken cancellationToken);

    Task AddToRoleAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken);
    Task<List<string>> GetRolesAsync(Guid userId);
    Task<ApiResponse<PagedUserResponseDto>> GetUsersAsync(
     GetUsersRequestDto request,
     CancellationToken cancellationToken);

    Task<int> GetUsersCountAsync(
        string? search,
        string? status,
        Guid? tenantId,
        CancellationToken cancellationToken);

    Task<ApiResponse<UserDetailsDto?>> GetUserDetailsAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<ApiResponse<UserEnableDisableDto?>> DisableUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<ApiResponse<UserEnableDisableDto?>> EnableUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<ApiResponse<List<UserTenantDto>>> GetUserTenantsAsync(
       Guid userId,
       CancellationToken cancellationToken);

}