
using Ragflow.Identity.Application.Services;

public interface IAuthService
{
    Task<ApiResponse<LoginUserDto>> LoginAsync(
         LoginRequestDto request,
         CancellationToken cancellationToken);

    Task<ApiResponse<LoginResponseDto>> RefreshTokenAsync(
         RefreshTokenRequestDto request,
         CancellationToken cancellationToken);
    Task<RegisterResponseDto> RegisterAsync(
RegisterRequestDto request,
CancellationToken cancellationToken);

    Task<ApiResponse<LogoutResponseDto>> LogoutAsync(
    string refreshToken,
    CancellationToken cancellationToken);
}