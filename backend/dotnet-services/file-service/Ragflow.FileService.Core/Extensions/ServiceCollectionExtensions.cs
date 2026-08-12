using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Mappings;
using Ragflow.FileService.Core.Validators;
using FileServiceImplementation = Ragflow.FileService.Core.Services.FileService;

namespace Ragflow.FileService.Core.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCoreServices(
        this IServiceCollection services)
    {
        // Register Application Services here
        services.AddScoped<IFileService, FileServiceImplementation>();


        services.AddValidatorsFromAssemblyContaining<CreateFileRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateFileRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<RenameFileRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<GetFilesRequestValidator>();

        services.AddAutoMapper(typeof(FileMappingProfile).Assembly);
        return services;
    }
}