using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ragflow.FileService.Core.Constants;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Interfaces.Persistence;
using Ragflow.FileService.Core.Options;
using Ragflow.FileService.Infrastructure.Persistence;
using Ragflow.FileService.Infrastructure.Persistence.Repositories;
using Ragflow.FileService.Infrastructure.Storage;
using Ragflow.Identity.Infrastructure.Persistence;

namespace Ragflow.FileService.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<FileDbContext>(options =>
        {
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString));
        });

        // Register Repositories
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));


        var storageOptions = configuration
    .GetSection("Storage")
    .Get<StorageOptions>();

        if (storageOptions == null)
        {
            throw new InvalidOperationException(
                "Storage configuration is missing.");
        }

        // Register StorageOptions
        services.AddSingleton(storageOptions);

        // Register IAmazonS3
        services.AddSingleton<IAmazonS3>(sp =>
        {
            var options = sp.GetRequiredService<StorageOptions>().S3;

            var config = new AmazonS3Config
            {
                ServiceURL = options.Endpoint,
                ForcePathStyle = true,
                UseHttp = !options.UseSSL
            };

            return new AmazonS3Client(
                options.AccessKey,
                options.SecretKey,
                config);
        });


        // Register Storage Provider
        switch (storageOptions.Provider)
        {
            case StorageProviders.Local:
                services.AddScoped<IStorageProvider, LocalStorageProvider>();
                break;


            case StorageProviders.MinIO:
                services.AddScoped<IStorageProvider, MinioStorageProvider>();
                break;


            case StorageProviders.S3:
                services.AddScoped<IStorageProvider, S3StorageProvider>();
                break;


            default:
                throw new InvalidOperationException(
                    $"Unsupported storage provider: {storageOptions.Provider}");
        }

        services.AddScoped<IFileRepository, FileRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}