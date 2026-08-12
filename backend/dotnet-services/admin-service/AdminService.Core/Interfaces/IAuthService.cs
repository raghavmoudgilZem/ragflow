using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Core.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<LoginUserDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken
    );

    Task<ApiResponse<RefreshTokenResponseDto>> RefreshAsync(
        RefreshTokenRequestDto request,
        CancellationToken cancellationToken
    );

    Task<ApiResponse<LogoutResponseDto>> LogoutAsync(
        LogoutRequestDto request,
        CancellationToken cancellationToken
    );
}
