using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.Extensions;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Validators;
using FileServiceImplementation = Ragflow.FileService.Core.Services.FileService;

namespace Ragflow.FileService.Tests.Core.Extensions;

[TestFixture]
public class ServiceCollectionExtensionsTests
{
[Test]
public void AddCoreServices_Should_Register_FileService()
{
    // Arrange
    var services = new ServiceCollection();

    // Act
    services.AddCoreServices();

    // Assert
    var descriptor = services.FirstOrDefault(x =>
        x.ServiceType == typeof(IFileService));

    Assert.That(descriptor, Is.Not.Null);
    Assert.That(descriptor!.ImplementationType,
        Is.EqualTo(typeof(FileServiceImplementation)));
}

    [Test]
    public void AddCoreServices_Should_Register_AutoMapper()
    {
        // Arrange
        var services = new ServiceCollection();

        // Act
        services.AddCoreServices();

        var provider = services.BuildServiceProvider();

        // Assert
        var mapper = provider.GetService<IMapper>();

        Assert.That(mapper, Is.Not.Null);
    }

    [Test]
    public void AddCoreServices_Should_Register_CreateFileRequestValidator()
    {
        // Arrange
        var services = new ServiceCollection();

        // Act
        services.AddCoreServices();

        var provider = services.BuildServiceProvider();

        // Assert
        var validator = provider.GetService<IValidator<CreateFileRequest>>();

        Assert.That(validator, Is.Not.Null);
        Assert.That(validator, Is.TypeOf<CreateFileRequestValidator>());
    }

    [Test]
    public void AddCoreServices_Should_Register_UpdateFileRequestValidator()
    {
        // Arrange
        var services = new ServiceCollection();

        services.AddCoreServices();

        var provider = services.BuildServiceProvider();

        // Assert
        var validator = provider.GetService<IValidator<UpdateFileRequest>>();

        Assert.That(validator, Is.Not.Null);
        Assert.That(validator, Is.TypeOf<UpdateFileRequestValidator>());
    }

    [Test]
    public void AddCoreServices_Should_Register_RenameFileRequestValidator()
    {
        // Arrange
        var services = new ServiceCollection();

        services.AddCoreServices();

        var provider = services.BuildServiceProvider();

        // Assert
        var validator = provider.GetService<IValidator<RenameFileRequest>>();

        Assert.That(validator, Is.Not.Null);
        Assert.That(validator, Is.TypeOf<RenameFileRequestValidator>());
    }

    [Test]
    public void AddCoreServices_Should_Register_GetFilesRequestValidator()
    {
        // Arrange
        var services = new ServiceCollection();

        services.AddCoreServices();

        var provider = services.BuildServiceProvider();

        // Assert
        var validator = provider.GetService<IValidator<GetFilesRequest>>();

        Assert.That(validator, Is.Not.Null);
        Assert.That(validator, Is.TypeOf<GetFilesRequestValidator>());
    }
}