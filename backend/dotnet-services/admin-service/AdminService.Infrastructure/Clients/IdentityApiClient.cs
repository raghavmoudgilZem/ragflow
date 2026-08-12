using System.Net.Http.Json;
using System.Text.Json;
using AdminService.Core.Constants;
using AdminService.Core.Interfaces;
using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Infrastructure.Clients;

public sealed class IdentityApiClient : IIdentityApiClient
{
    private readonly HttpClient _client;

    public IdentityApiClient(HttpClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<LoginUserDto>?> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await _client.PostAsJsonAsync(
                IdentityApiRoutes.Login,
                request,
                cancellationToken
            );

            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            // ===========================
            // ADD OPTION 3 CODE HERE
            // ===========================
            if (response.StatusCode == System.Net.HttpStatusCode.InternalServerError)
            {
                if (
                    content.Contains(
                        "Invalid email or password.",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    return ApiResponse<LoginUserDto>.ErrorResponse("Invalid email or password.");
                }
                return ApiResponse<LoginUserDto>.ErrorResponse(
                    "Identity Service encountered an internal error."
                );
            }

            // Existing success logic
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                var apiResponse1 = JsonSerializer.Deserialize<ApiResponse<LoginUserDto>>(
                    content,
                    options
                );

                return apiResponse1;
                // return JsonSerializer.Deserialize<ApiResponse<LoginUserDto>>(content);
            }

            // Existing validation error logic
            var validation = JsonSerializer.Deserialize<ValidationErrorResponse>(content);

            if (validation?.Errors != null)
            {
                return ApiResponse<LoginUserDto>.ErrorResponse(
                    validation.Errors.SelectMany(x => x.Value).ToList()
                );
            }

            // Existing ApiResponse logic
            var apiResponse = JsonSerializer.Deserialize<ApiResponse<LoginUserDto>>(content);

            return apiResponse ?? ApiResponse<LoginUserDto>.ErrorResponse("Login failed.");
        }
        catch (HttpRequestException)
        {
            return ServiceUnavailable<LoginUserDto>();
        }
        catch (TaskCanceledException)
        {
            return ServiceUnavailable<LoginUserDto>();
        }
    }

    public async Task<ApiResponse<RefreshTokenResponseDto>?> RefreshAsync(
        RefreshTokenRequestDto request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await _client.PostAsJsonAsync(
                IdentityApiRoutes.Refresh,
                request,
                cancellationToken
            );

            return await response.Content.ReadFromJsonAsync<ApiResponse<RefreshTokenResponseDto>>(
                cancellationToken
            );
        }
        catch (HttpRequestException)
        {
            return ServiceUnavailable<RefreshTokenResponseDto>();
        }
        catch (TaskCanceledException)
        {
            return ServiceUnavailable<RefreshTokenResponseDto>();
        }
    }

    public async Task<ApiResponse<LogoutResponseDto>?> LogoutAsync(
        LogoutRequestDto request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await _client.PostAsJsonAsync(
                IdentityApiRoutes.Logout,
                request,
                cancellationToken
            );

            return await response.Content.ReadFromJsonAsync<ApiResponse<LogoutResponseDto>>(
                cancellationToken
            );
        }
        catch (HttpRequestException)
        {
            return ServiceUnavailable<LogoutResponseDto>();
        }
        catch (TaskCanceledException)
        {
            return ServiceUnavailable<LogoutResponseDto>();
        }
    }

    private static ApiResponse<T> ServiceUnavailable<T>()
    {
        return ApiResponse<T>.ErrorResponse(
            "Identity Service is currently unavailable. Please try again later."
        );
    }
}
