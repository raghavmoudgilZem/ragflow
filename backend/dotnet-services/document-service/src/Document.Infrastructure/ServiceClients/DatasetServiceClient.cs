using System.Net;
using System.Net.Http.Json;
using Document.Application.DTOs.External;
using Document.Application.Interfaces.Clients;

namespace Document.Infrastructure.ServiceClients;

public sealed class DatasetServiceClient : IDatasetServiceClient
{
    private readonly HttpClient _httpClient;

    public DatasetServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<KnowledgeBaseDto?> GetKnowledgeBaseAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"api/v1/knowledgebases/{knowledgeBaseId}");

        request.Headers.Add("X-Tenant-Id", tenantId.ToString());

        var response = await _httpClient.SendAsync(
            request,
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<KnowledgeBaseDto>(
            cancellationToken: cancellationToken);
    }
}