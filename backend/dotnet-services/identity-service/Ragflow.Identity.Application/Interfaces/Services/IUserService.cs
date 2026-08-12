using Ragflow.Identity.Application.DTOs;

public interface IUserService
{
    Task<ApiResponse<PagedUserResponseDto>>
         GetUsersAsync(
             GetUsersRequestDto request,
             CancellationToken cancellationToken);


    Task<ApiResponse<UserDetailsDto?>> GetUserAsync(
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