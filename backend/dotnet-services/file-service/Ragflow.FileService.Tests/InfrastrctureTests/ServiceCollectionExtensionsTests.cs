using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Ragflow.FileService.Core.Constants;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Options;
using Ragflow.FileService.Infrastructure.Extensions;
using Ragflow.FileService.Infrastructure.Storage;

namespace Ragflow.FileService.Tests.Extensions;

[TestFixture]
public class ServiceCollectionExtensionsTests
{
    private IConfiguration _configuration = null!;


    private IConfiguration CreateConfiguration(string provider)
{
    var settings = new Dictionary<string, string?>
    {
        ["ConnectionStrings:DefaultConnection"] = TestData.TestConstants.DefaultConnectionString,

        ["Storage:Provider"] = provider,

        ["Storage:LocalPath"] = TestData.TestConstants.LocalStoragePath,

        ["Storage:S3:Endpoint"] = TestData.TestConstants.S3Endpoint,
        ["Storage:S3:BucketName"] = TestData.TestConstants.S3BucketName,
        ["Storage:S3:AccessKey"] = TestData.TestConstants.S3AccessKey,
        ["Storage:S3:SecretKey"] = TestData.TestConstants.S3SecretKey,
        ["Storage:S3:UseSSL"] = TestData.TestConstants.S3UseSSL.ToString(),

        ["Storage:MinIO:Endpoint"] = TestData.TestConstants.MinioEndpoint,
        ["Storage:MinIO:BucketName"] = TestData.TestConstants.MinIOBucketName,
        ["Storage:MinIO:AccessKey"] = TestData.TestConstants.MinioAccessKey,
        ["Storage:MinIO:SecretKey"] = TestData.TestConstants.MinioSecretKey,
        ["Storage:MinIO:UseSSL"] = TestData.TestConstants.MinioUseSsl.ToString()
    };

    return new ConfigurationBuilder()
        .AddInMemoryCollection(settings)
        .Build();
}


    [Test]
    public void AddInfrastructureServices_ShouldRegisterLocalStorageProvider()
    {
        var services = new ServiceCollection();

        services.AddLogging();

        _configuration =
            CreateConfiguration(StorageProviders.Local);


        services.AddInfrastructureServices(
            _configuration);


        var provider =
            services.BuildServiceProvider();


        var storage =
            provider.GetRequiredService<IStorageProvider>();


        Assert.That(
            storage,
            Is.TypeOf<LocalStorageProvider>());
    }



    [Test]
    public void AddInfrastructureServices_ShouldRegisterMinioStorageProvider()
    {
        var services = new ServiceCollection();

        services.AddLogging();

        _configuration =
            CreateConfiguration(StorageProviders.MinIO);


        services.AddInfrastructureServices(
            _configuration);


        var provider =
            services.BuildServiceProvider();


        var storage =
            provider.GetRequiredService<IStorageProvider>();


        Assert.That(
            storage,
            Is.TypeOf<MinioStorageProvider>());
    }



    [Test]
    public void AddInfrastructureServices_ShouldRegisterS3StorageProvider()
    {
        var services = new ServiceCollection();

        services.AddLogging();

        _configuration =
            CreateConfiguration(StorageProviders.S3);


        services.AddInfrastructureServices(
            _configuration);


        var provider =
            services.BuildServiceProvider();


        var storage =
            provider.GetRequiredService<IStorageProvider>();


        Assert.That(
            storage,
            Is.TypeOf<S3StorageProvider>());
    }



    [Test]
    public void AddInfrastructureServices_ShouldRegisterGenericRepository()
    {
        var services = new ServiceCollection();

        services.AddLogging();

        _configuration =
            CreateConfiguration(StorageProviders.Local);


        services.AddInfrastructureServices(
            _configuration);


        var descriptor =
            services.FirstOrDefault(
                x => x.ServiceType.Name.Contains(
                    "IGenericRepository"));


        Assert.That(
            descriptor,
            Is.Not.Null);
    }



    [Test]
    public void AddInfrastructureServices_ShouldRegisterS3Client()
    {
        var services = new ServiceCollection();

        _configuration =
            CreateConfiguration(StorageProviders.S3);


        services.AddInfrastructureServices(
            _configuration);


        var provider =
            services.BuildServiceProvider();


        var client =
            provider.GetService<IAmazonS3>();


        Assert.That(
            client,
            Is.Not.Null);
    }



    [Test]
    public void AddInfrastructureServices_ShouldThrow_WhenStorageConfigurationMissing()
    {
        var configuration =
            new ConfigurationBuilder()
                .AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        {
                            "ConnectionStrings:DefaultConnection",
                            "test"
                        }
                    })
                .Build();


        var services =
            new ServiceCollection();


        Assert.Throws<InvalidOperationException>(
            () =>
            {
                services.AddInfrastructureServices(
                    configuration);
            });
    }



    [Test]
    public void AddInfrastructureServices_ShouldThrow_WhenProviderUnsupported()
    {
        var services =
            new ServiceCollection();


        var configuration =
            CreateConfiguration("InvalidProvider");


        Assert.Throws<InvalidOperationException>(
            () =>
            {
                services.AddInfrastructureServices(
                    configuration);
            });
    }
}