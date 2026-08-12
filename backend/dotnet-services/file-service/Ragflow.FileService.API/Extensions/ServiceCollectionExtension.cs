using Ragflow.FileService.Core.Options;

namespace Ragflow.FileService.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<StorageOptions>(
            configuration.GetSection(StorageOptions.SectionName));

        services.Configure<MinioOptions>(
            configuration.GetSection(MinioOptions.SectionName));

        services.Configure<IdentityServiceOptions>(
            configuration.GetSection(IdentityServiceOptions.SectionName));

        return services;
    }
}