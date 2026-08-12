using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using AdminService.Core.Interfaces;
using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Infrastructure.Clients;

public class UsersApiClient : IUsersApiClient
{
    private readonly HttpClient _httpClient;

    public UsersApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ApiResponse<PagedUserResponseDto>?> GetUsersAsync(
        GetUsersRequestDto request,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        SetAuthorizationHeader(authorization);

        var query = new StringBuilder("/api/v1/users?");

        query.Append($"page={request.Page}");
        query.Append($"&pageSize={request.PageSize}");

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query.Append($"&search={Uri.EscapeDataString(request.Search)}");
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            query.Append($"&status={Uri.EscapeDataString(request.Status)}");
        }

        if (request.TenantId.HasValue)
        {
            query.Append($"&tenantId={request.TenantId.Value}");
        }

        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            query.Append($"&sortBy={Uri.EscapeDataString(request.SortBy)}");
        }

        if (!string.IsNullOrWhiteSpace(request.SortOrder))
        {
            query.Append($"&sortOrder={Uri.EscapeDataString(request.SortOrder)}");
        }

        var response = await _httpClient.GetAsync(query.ToString(), cancellationToken);

        return await ReadResponseAsync<ApiResponse<PagedUserResponseDto>>(
            response,
            cancellationToken
        );
    }

    public async Task<ApiResponse<UserDetailsDto>?> GetUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        SetAuthorizationHeader(authorization);

        var response = await _httpClient.GetAsync($"/api/v1/users/{userId}", cancellationToken);

        return await ReadResponseAsync<ApiResponse<UserDetailsDto>>(response, cancellationToken);
    }

    public async Task<ApiResponse<UserEnableDisableDto>?> EnableUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        SetAuthorizationHeader(authorization);

        var response = await _httpClient.PutAsync(
            $"/api/v1/users/{userId}/enable",
            null,
            cancellationToken
        );

        return await ReadResponseAsync<ApiResponse<UserEnableDisableDto>>(
            response,
            cancellationToken
        );
    }

    public async Task<ApiResponse<UserEnableDisableDto>?> DisableUserAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        SetAuthorizationHeader(authorization);

        var response = await _httpClient.PutAsync(
            $"/api/v1/users/{userId}/disable",
            null,
            cancellationToken
        );

        return await ReadResponseAsync<ApiResponse<UserEnableDisableDto>>(
            response,
            cancellationToken
        );
    }

    public async Task<ApiResponse<List<UserTenantDto>>?> GetUserTenantsAsync(
        Guid userId,
        string? authorization,
        CancellationToken cancellationToken
    )
    {
        SetAuthorizationHeader(authorization);

        var response = await _httpClient.GetAsync(
            $"/api/v1/users/{userId}/tenants",
            cancellationToken
        );

        return await ReadResponseAsync<ApiResponse<List<UserTenantDto>>>(
            response,
            cancellationToken
        );
    }

    private static async Task<T?> ReadResponseAsync<T>(
        HttpResponseMessage response,
        CancellationToken cancellationToken
    )
    {
        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadFromJsonAsync<T>(cancellationToken);
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        throw new HttpRequestException(
            string.IsNullOrWhiteSpace(body)
                ? $"Identity Service returned {(int)response.StatusCode} {response.ReasonPhrase}"
                : body,
            null,
            response.StatusCode
        );
    }

    private void SetAuthorizationHeader(string? authorization)
    {
        _httpClient.DefaultRequestHeaders.Authorization = null;

        if (!string.IsNullOrWhiteSpace(authorization))
        {
            _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(
                authorization
            );
        }
    }
}
