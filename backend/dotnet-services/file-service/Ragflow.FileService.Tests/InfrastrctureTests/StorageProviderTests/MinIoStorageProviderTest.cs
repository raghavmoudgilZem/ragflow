using System.Text;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Ragflow.FileService.Core.Options;
using Ragflow.FileService.Infrastructure.Storage;
using Ragflow.FileService.Tests.TestData;

namespace Ragflow.FileService.Tests.Storage;

[TestFixture]
public class MinioStorageProviderTests
{
    private MinioStorageProvider _provider = null!;


    [SetUp]
    public void Setup()
    {
        var options = new StorageOptions
        {
            MinIO = new MinioOptions
            {
                Endpoint = TestConstants.MinioEndpoint,
                BucketName = TestConstants.MinIOBucketName,
                AccessKey = TestConstants.MinioAccessKey,
                SecretKey = TestConstants.MinioSecretKey,
                UseSSL = false
            }
        };


        var logger =
            Mock.Of<ILogger<MinioStorageProvider>>();


        _provider =
            new MinioStorageProvider(
                options,
                logger);
    }


    [Test]
    public async Task UploadAsync_ShouldUploadFile()
    {
        await using var stream =
            new MemoryStream(
                Encoding.UTF8.GetBytes(
                    TestConstants.UploadContent));


        await _provider.UploadAsync(
            stream,
            TestConstants.ValidFileName,
            TestConstants.ValidObjectKey,
            TestConstants.ValidContentType);


        var exists =
            await _provider.ExistsAsync(
                TestConstants.ValidObjectKey);


        Assert.That(
            exists,
            Is.True);
    }


    [Test]
    public async Task DownloadAsync_ShouldReturnContent()
    {
        await using var uploadStream =
            new MemoryStream(
                Encoding.UTF8.GetBytes(
                    TestConstants.DownloadContent));


        await _provider.UploadAsync(
            uploadStream,
            TestConstants.ValidFileName,
            TestConstants.ValidDownloadObjectKey,
            TestConstants.ValidContentType);



        await using var download =
            await _provider.DownloadAsync(
                TestConstants.ValidDownloadObjectKey);



        using var reader =
            new StreamReader(download);



        var content =
            await reader.ReadToEndAsync();



        Assert.That(
            content,
            Is.EqualTo(
                TestConstants.DownloadContent));
    }


    [Test]
    public async Task DeleteAsync_ShouldDeleteObject()
    {
        await using var stream =
            new MemoryStream(
                Encoding.UTF8.GetBytes(
                    TestConstants.UploadContent));



        await _provider.UploadAsync(
            stream,
            TestConstants.ValidFileName,
            TestConstants.ValidDeleteObjectKey,
            TestConstants.ValidContentType);



        await _provider.DeleteAsync(
            TestConstants.ValidDeleteObjectKey);



        var exists =
            await _provider.ExistsAsync(
                TestConstants.ValidDeleteObjectKey);



        Assert.That(
            exists,
            Is.False);
    }



    [Test]
    public async Task ExistsAsync_ShouldReturnTrue_WhenObjectExists()
    {
        await using var stream =
            new MemoryStream(
                Encoding.UTF8.GetBytes(
                    TestConstants.UploadContent));



        await _provider.UploadAsync(
            stream,
            TestConstants.ValidFileName,
            TestConstants.ValidObjectKey,
            TestConstants.ValidContentType);



        Assert.That(
            await _provider.ExistsAsync(
                TestConstants.ValidObjectKey),
            Is.True);
    }



    [Test]
    public async Task ExistsAsync_ShouldReturnFalse_WhenObjectDoesNotExist()
    {
        var result =
            await _provider.ExistsAsync(
                TestConstants.InvalidObjectKey);


        Assert.That(
            result,
            Is.False);
    }



    [Test]
    public async Task MoveAsync_ShouldMoveObject()
    {
        await using var stream =
            new MemoryStream(
                Encoding.UTF8.GetBytes(
                    TestConstants.MoveContent));



        await _provider.UploadAsync(
            stream,
            TestConstants.ValidFileName,
            TestConstants.ValidMoveSourceObjectKey,
            TestConstants.ValidContentType);



        await _provider.MoveAsync(
            TestConstants.ValidMoveSourceObjectKey,
            TestConstants.ValidMoveDestinationObjectKey);



        Assert.Multiple(async () =>
        {
            Assert.That(
                await _provider.ExistsAsync(
                    TestConstants.ValidMoveSourceObjectKey),
                Is.False);


            Assert.That(
                await _provider.ExistsAsync(
                    TestConstants.ValidMoveDestinationObjectKey),
                Is.True);
        });
    }



    [Test]
    public async Task MoveAsync_ShouldPreserveContent()
    {
        await using var stream =
            new MemoryStream(
                Encoding.UTF8.GetBytes(
                    TestConstants.MoveContent));



        await _provider.UploadAsync(
            stream,
            TestConstants.ValidFileName,
            TestConstants.ValidMoveSourceObjectKey,
            TestConstants.ValidContentType);



        await _provider.MoveAsync(
            TestConstants.ValidMoveSourceObjectKey,
            TestConstants.ValidMoveDestinationObjectKey);



        await using var download =
            await _provider.DownloadAsync(
                TestConstants.ValidMoveDestinationObjectKey);



        using var reader =
            new StreamReader(download);



        Assert.That(
            await reader.ReadToEndAsync(),
            Is.EqualTo(
                TestConstants.MoveContent));
    }



    [Test]
    public void DownloadAsync_ShouldThrow_WhenObjectDoesNotExist()
    {
        var exception =
            Assert.ThrowsAsync<InvalidOperationException>(
                async () =>
                    await _provider.DownloadAsync(
                        TestConstants.InvalidObjectKey));


        Assert.That(
            exception!.Message,
            Does.Contain(
                "Failed to download object"));
    }



    [Test]
    public void MoveAsync_ShouldThrow_WhenSourceDoesNotExist()
    {
        var exception =
            Assert.ThrowsAsync<InvalidOperationException>(
                async () =>
                    await _provider.MoveAsync(
                        TestConstants.InvalidObjectKey,
                        TestConstants.ValidMoveDestinationObjectKey));


        Assert.That(
            exception!.Message,
            Does.Contain(
                "Failed to move object"));
    }
}