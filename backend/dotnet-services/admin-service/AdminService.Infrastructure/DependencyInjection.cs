using AdminService.Core.Interfaces;
using AdminService.Infrastructure.Clients;
using AdminService.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AdminService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        // Identity API Client (Authentication)
        services.AddHttpClient<IIdentityApiClient, IdentityApiClient>(client =>
        {
            client.BaseAddress = new Uri(configuration["Services:IdentityService"]!);
        });

        // Users API Client
        services.AddHttpClient<IUsersApiClient, UsersApiClient>(client =>
        {
            client.BaseAddress = new Uri(configuration["Services:IdentityService"]!);
        });

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUsersService, UsersService>();

        return services;
    }
}
