using System.Net.Http.Headers;
using System.Net.Http.Json;
using Document.Application.DTOs.Common;
using Document.Application.DTOs.External;
using Document.Application.Interfaces.Clients;

namespace Document.Infrastructure.ServiceClients;

public sealed class FileServiceClient : IFileServiceClient
{
    private readonly HttpClient _httpClient;

    public FileServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<UploadFileResponse> UploadFileAsync(
        FileUploadRequest file,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        using var form = new MultipartFormDataContent();

        var streamContent = new StreamContent(file.Content);

        streamContent.Headers.ContentType =
            new MediaTypeHeaderValue(file.ContentType);

        form.Add(
            streamContent,
            "file",
            file.FileName);

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "api/v1/files");

        request.Headers.Add("X-Tenant-Id", tenantId.ToString());

        request.Headers.Add("X-User-Id", userId.ToString());

        request.Content = form;

        var response = await _httpClient.SendAsync(
            request,
            cancellationToken);

        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<UploadFileResponse>(
            cancellationToken: cancellationToken))!;
    }

    public async Task DeleteFileAsync(
        Guid fileId,
        CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.DeleteAsync(
            $"api/v1/files/{fileId}",
            cancellationToken);

        response.EnsureSuccessStatusCode();
    }
}