using System.Net.Http.Json;
using Document.Application.Interfaces.Clients;

namespace Document.Infrastructure.ServiceClients;

public sealed class ParsingServiceClient : IParsingServiceClient
{
    private readonly HttpClient _httpClient;

    public ParsingServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task StartParsingAsync(
        Guid documentId,
        Guid datasetId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var request = new
        {
            documentId,
            datasetId
        };

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "api/v1/parsing/start")
        {
            Content = JsonContent.Create(request)
        };

        httpRequest.Headers.Add("X-Tenant-Id", tenantId.ToString());

        var response = await _httpClient.SendAsync(
            httpRequest,
            cancellationToken);

        response.EnsureSuccessStatusCode();
    }

    public async Task StopParsingAsync(
        Guid documentId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var request = new
        {
            documentId
        };

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "api/v1/parsing/stop")
        {
            Content = JsonContent.Create(request)
        };

        httpRequest.Headers.Add("X-Tenant-Id", tenantId.ToString());

        var response = await _httpClient.SendAsync(
            httpRequest,
            cancellationToken);

        response.EnsureSuccessStatusCode();
    }
}