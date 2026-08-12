using AdminService.Core.Interfaces;
using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IIdentityApiClient _identityApi;

    public AuthService(IIdentityApiClient identityApi)
    {
        _identityApi = identityApi;
    }

    public async Task<ApiResponse<LoginUserDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityApi.LoginAsync(request, cancellationToken);

        return result ?? ApiResponse<LoginUserDto>.ErrorResponse("Login failed.");
    }

    public async Task<ApiResponse<RefreshTokenResponseDto>> RefreshAsync(
        RefreshTokenRequestDto request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityApi.RefreshAsync(request, cancellationToken);

        return result ?? ApiResponse<RefreshTokenResponseDto>.ErrorResponse("Refresh failed.");
    }

    public async Task<ApiResponse<LogoutResponseDto>> LogoutAsync(
        LogoutRequestDto request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityApi.LogoutAsync(request, cancellationToken);

        return result ?? ApiResponse<LogoutResponseDto>.ErrorResponse("Logout failed.");
    }
}
