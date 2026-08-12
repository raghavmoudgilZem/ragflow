using Document.Application.Interfaces.Clients;
using Document.Application.Interfaces.Persistence;
using Document.Application.Interfaces.Repositories;
using Document.Application.Interfaces.Services;
using Document.Application.Services;
using Document.Infrastructure.Persistence;
using Document.Infrastructure.Repositories;
using Document.Infrastructure.ServiceClients;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Ragflow.Identity.Application.Interfaces;
using Ragflow.Identity.Infrastructure.Repositories;

namespace Document.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IDocumentRepository, DocumentRepository>();

        services.AddScoped<IFileDocumentRepository, FileDocumentRepository>();

        services.AddScoped<IDocumentTaskRepository, DocumentTaskRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
     
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<IOutboxRepository, OutboxRepository>();

          services.AddHttpClient<IDatasetServiceClient, DatasetServiceClient>(
        (serviceProvider, client) =>
        {
            var settings = serviceProvider
                .GetRequiredService<IOptions<DatasetServiceSettings>>()
                .Value;

            client.BaseAddress = new Uri(settings.BaseUrl);
        });

    services.AddHttpClient<IFileServiceClient, FileServiceClient>(
        (serviceProvider, client) =>
        {
            var settings = serviceProvider
                .GetRequiredService<IOptions<FileServiceSettings>>()
                .Value;

            client.BaseAddress = new Uri(settings.BaseUrl);
        });

    services.AddHttpClient<IParsingServiceClient, ParsingServiceClient>(
        (serviceProvider, client) =>
        {
            var settings = serviceProvider
                .GetRequiredService<IOptions<ParsingServiceSettings>>()
                .Value;

            client.BaseAddress = new Uri(settings.BaseUrl);
        });
        return services;

    }
}