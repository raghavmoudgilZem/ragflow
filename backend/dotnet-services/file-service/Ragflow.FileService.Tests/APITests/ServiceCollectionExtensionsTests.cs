using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using NUnit.Framework;
using Ragflow.FileService.API.Extensions;
using Ragflow.FileService.Core.Options;

namespace Ragflow.FileService.Tests.API.Extensions;

[TestFixture]
public class ServiceCollectionExtensionsTests
{
    [Test]
    public void AddApiServices_Should_Register_All_Options()
    {
        // Arrange
        var settings = new Dictionary<string, string?>
        {
            ["Storage:Provider"] = TestData.TestConstants.StorageProvider,
            ["Storage:LocalPath"] = TestData.TestConstants.LocalStoragePath,

            ["Minio:Endpoint"] = TestData.TestConstants.MinioEndpoint,
            ["Minio:AccessKey"] = TestData.TestConstants.MinioAccessKey,
            ["Minio:SecretKey"] = TestData.TestConstants.MinioSecretKey,
            ["Minio:BucketName"] = TestData.TestConstants.MinIOBucketName,

            ["IdentityService:BaseUrl"] = TestData.TestConstants.IdentityServiceBaseUrl
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();

        var services = new ServiceCollection();

        // Act
        services.AddApiServices(configuration);

        var provider = services.BuildServiceProvider();

        // Assert
        var storageOptions =
            provider.GetRequiredService<IOptions<StorageOptions>>().Value;

        var minioOptions =
            provider.GetRequiredService<IOptions<MinioOptions>>().Value;

        var identityOptions =
            provider.GetRequiredService<IOptions<IdentityServiceOptions>>().Value;

        Assert.That(storageOptions.Provider, Is.EqualTo(TestData.TestConstants.StorageProvider));
        Assert.That(storageOptions.LocalPath, Is.EqualTo(TestData.TestConstants.LocalStoragePath));

        Assert.That(minioOptions.Endpoint, Is.EqualTo(TestData.TestConstants.MinioEndpoint));
        Assert.That(minioOptions.AccessKey, Is.EqualTo(TestData.TestConstants.MinioAccessKey));
        Assert.That(minioOptions.SecretKey, Is.EqualTo(TestData.TestConstants.MinioSecretKey));
        Assert.That(minioOptions.BucketName, Is.EqualTo(TestData.TestConstants.MinIOBucketName));

        Assert.That(identityOptions.BaseUrl, Is.EqualTo(TestData.TestConstants.IdentityServiceBaseUrl));
    }
}