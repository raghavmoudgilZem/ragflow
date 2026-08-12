using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Ragflow.FileService.Core.Options;
using Ragflow.FileService.Infrastructure.Storage;
using System.IO;
using System.Net;
using System.Text;

namespace Ragflow.FileService.Tests.Storage;

[TestFixture]
public class S3StorageProviderTests
{
    private Mock<IAmazonS3> _s3ClientMock = null!;
    private Mock<ILogger<S3StorageProvider>> _loggerMock = null!;
    private S3StorageProvider _provider = null!;

    [SetUp]
    public void Setup()
    {
        _s3ClientMock = new Mock<IAmazonS3>();
        _loggerMock = new Mock<ILogger<S3StorageProvider>>();

        var options = new StorageOptions
        {
            S3 = new S3Options
            {
                BucketName = TestData.TestConstants.S3BucketName,
                Endpoint = TestData.TestConstants.S3Endpoint,
                AccessKey = TestData.TestConstants.S3AccessKey,
                SecretKey = TestData.TestConstants.S3SecretKey,
                UseSSL = TestData.TestConstants.S3UseSSL
            }
        };

        _provider = new S3StorageProvider(
            _s3ClientMock.Object,
            options,
            _loggerMock.Object);
    }

    [Test]
    public async Task UploadAsync_Should_Call_PutObjectAsync()
    {
        _s3ClientMock
            .Setup(x => x.PutObjectAsync(
                It.IsAny<PutObjectRequest>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PutObjectResponse());

        await using var stream =
            new MemoryStream(Encoding.UTF8.GetBytes(TestData.TestConstants.UploadContent));

        await _provider.UploadAsync(
            stream,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidContentType);

        _s3ClientMock.Verify(x =>
            x.PutObjectAsync(
                It.IsAny<PutObjectRequest>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task ExistsAsync_Should_Return_True()
    {
        _s3ClientMock
            .Setup(x => x.GetObjectMetadataAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GetObjectMetadataResponse());

        var exists = await _provider.ExistsAsync(TestData.TestConstants.ValidFileName);

        Assert.That(exists, Is.True);
    }

    [Test]
    public async Task ExistsAsync_Should_Return_False_When_NotFound()
    {
        _s3ClientMock
            .Setup(x => x.GetObjectMetadataAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new AmazonS3Exception(TestData.TestConstants.FileNotFoundMessage)
            {
                StatusCode = HttpStatusCode.NotFound
            });

        var exists = await _provider.ExistsAsync(TestData.TestConstants.MissingFileName);

        Assert.That(exists, Is.False);
    }

    [Test]
    public async Task DeleteAsync_Should_Call_DeleteObjectAsync()
    {
        _s3ClientMock
            .Setup(x => x.DeleteObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeleteObjectResponse());

        await _provider.DeleteAsync("test/file.txt");

        _s3ClientMock.Verify(x =>
            x.DeleteObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task MoveAsync_Should_Copy_And_Delete_Object()
    {
        _s3ClientMock
            .Setup(x => x.CopyObjectAsync(
                It.IsAny<CopyObjectRequest>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CopyObjectResponse());

        _s3ClientMock
            .Setup(x => x.DeleteObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeleteObjectResponse());

        await _provider.MoveAsync(
            TestData.TestConstants.SourceFileName,
            TestData.TestConstants.DestinationFileName);

        _s3ClientMock.Verify(x =>
            x.CopyObjectAsync(
                It.IsAny<CopyObjectRequest>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _s3ClientMock.Verify(x =>
            x.DeleteObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
    [Test]
public async Task DownloadAsync_Should_Return_Stream()
{
    var response = new GetObjectResponse
    {
        ResponseStream = new MemoryStream(
            Encoding.UTF8.GetBytes(TestData.TestConstants.DownloadContent))
    };

    _s3ClientMock
        .Setup(x => x.GetObjectAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
        .ReturnsAsync(response);


    var result = await _provider.DownloadAsync(
        TestData.TestConstants.ValidFileName);


    using var reader = new StreamReader(result);

    var content = await reader.ReadToEndAsync();

    Assert.That(content, Is.EqualTo(TestData.TestConstants.DownloadContent));
}
[Test]
public void UploadAsync_Should_Throw_When_S3_Fails()
{
    _s3ClientMock
        .Setup(x => x.PutObjectAsync(
            It.IsAny<PutObjectRequest>(),
            It.IsAny<CancellationToken>()))
        .ThrowsAsync(new Exception(TestData.TestConstants.S3FailureMessage));


    Assert.ThrowsAsync<InvalidOperationException>(
        async () =>
        {
            await using var stream =
                new MemoryStream(
                    Encoding.UTF8.GetBytes("test"));


            await _provider.UploadAsync(
                stream,
                TestData.TestConstants.ValidFileName,
                TestData.TestConstants.ValidFileName,
                TestData.TestConstants.ValidContentType);
        });
}
[Test]
public void DownloadAsync_Should_Throw_When_S3_Fails()
{
    _s3ClientMock
        .Setup(x => x.GetObjectAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
        .ThrowsAsync(new Exception(TestData.TestConstants.DownloadFailedMessage));


    Assert.ThrowsAsync<InvalidOperationException>(
        async () =>
        {
            await _provider.DownloadAsync(
                TestData.TestConstants.MissingFileName);
        });
}
[Test]
public void DeleteAsync_Should_Throw_When_S3_Fails()
{
    _s3ClientMock
        .Setup(x => x.DeleteObjectAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
        .ThrowsAsync(new Exception(TestData.TestConstants.FileDeletedMessage));


    Assert.ThrowsAsync<InvalidOperationException>(
        async () =>
        {
            await _provider.DeleteAsync(
                TestData.TestConstants.ValidFileName);
        });
}
[Test]
public void ExistsAsync_Should_Throw_When_Unexpected_Error()
{
    _s3ClientMock
        .Setup(x => x.GetObjectMetadataAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
        .ThrowsAsync(new Exception(TestData.TestConstants.AwsErrorMessage));


    Assert.ThrowsAsync<InvalidOperationException>(
        async () =>
        {
            await _provider.ExistsAsync(
                TestData.TestConstants.ValidFileName);
        });
}
[Test]
public void MoveAsync_Should_Throw_When_Copy_Fails()
{
    _s3ClientMock
        .Setup(x => x.CopyObjectAsync(
            It.IsAny<CopyObjectRequest>(),
            It.IsAny<CancellationToken>()))
        .ThrowsAsync(new Exception("copy failed"));


    Assert.ThrowsAsync<InvalidOperationException>(
        async () =>
        {
            await _provider.MoveAsync(
                TestData.TestConstants.ValidFileName,
                TestData.TestConstants.ValidFileName);
        });
}
}