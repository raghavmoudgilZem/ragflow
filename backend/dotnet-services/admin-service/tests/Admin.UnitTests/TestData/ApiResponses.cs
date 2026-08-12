using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.TestData;

public static class ApiResponses
{
    public static ApiResponse<UserDetailsDto> UserDetailsSuccess()
    {
        return ApiResponse<UserDetailsDto>.SuccessResponse(UserDetailsDtos.Valid());
    }

    public static ApiResponse<List<UserTenantDto>> UserTenantsSuccess()
    {
        return ApiResponse<List<UserTenantDto>>.SuccessResponse(UserTenantDtos.Valid());
    }

    public static ApiResponse<PagedUserResponseDto> UsersSuccess()
    {
        return ApiResponse<PagedUserResponseDto>.SuccessResponse(new PagedUserResponseDto());
    }
}
