using System.Text;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework.Internal;
using Ragflow.FileService.Core.Options;
using Ragflow.FileService.Infrastructure.Storage;

namespace Ragflow.FileService.Tests.Storage;

[TestFixture]
public class LocalStorageProviderTests
{
    private LocalStorageProvider _provider = null!;
    private string _storagePath = null!;

    [SetUp]
    public void Setup()
    {
        _storagePath = Path.Combine(
            Path.GetTempPath(),
            Guid.NewGuid().ToString());

        var options = new StorageOptions
        {
            LocalPath = _storagePath
        };

        var logger = Mock.Of<ILogger<LocalStorageProvider>>();

        _provider = new LocalStorageProvider(options, logger);
    }

    [TearDown]
    public void TearDown()
    {
        if (Directory.Exists(_storagePath))
        {
            Directory.Delete(_storagePath, true);
        }
    }

    [Test]
    public async Task UploadAsync_Should_Create_File()
    {
        // Arrange
        var content = TestData.TestConstants.ValidDescription;

        var objectKey = TestData.TestConstants.ValidObjectKey;

        await using var stream = new MemoryStream(
            System.Text.Encoding.UTF8.GetBytes(content));


        // Act
        await _provider.UploadAsync(
            stream,
            TestData.TestConstants.ValidFileName,
            objectKey,
            TestData.TestConstants.ValidContentType);


        // Assert
        var filePath = Path.Combine(
            _storagePath,
            objectKey);


        Assert.Multiple(() =>
        {
            Assert.That(
                File.Exists(filePath),
                Is.True);


            Assert.That(
                File.ReadAllText(filePath),
                Is.EqualTo(content));
        });
    }

    [Test]
    public async Task ExistsAsync_Should_Return_True_When_File_Exists()
    {
        await using var stream = new MemoryStream(
            System.Text.Encoding.UTF8.GetBytes("data"));

        await _provider.UploadAsync(
            stream,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidContentType);

        var exists = await _provider.ExistsAsync(TestData.TestConstants.ValidFileName);

        Assert.That(exists, Is.True);
    }

    [Test]
    public async Task ExistsAsync_Should_Return_False_When_File_Does_Not_Exist()
    {
        var exists = await _provider.ExistsAsync(TestData.TestConstants.MissingFileName);

        Assert.That(exists, Is.False);
    }

    [Test]
    public async Task DownloadAsync_Should_Return_File_Stream()
    {
        const string content = TestData.TestConstants.ValidDescription;

        await using (var upload = new MemoryStream(
                         System.Text.Encoding.UTF8.GetBytes(content)))
        {
            await _provider.UploadAsync(
                upload,
                TestData.TestConstants.ValidFileName,
                TestData.TestConstants.ValidFileName,
                TestData.TestConstants.ValidContentType);
        }

        await using var result = await _provider.DownloadAsync(TestData.TestConstants.ValidFileName);

        using var reader = new StreamReader(result);

        var text = await reader.ReadToEndAsync();

        Assert.That(text, Is.EqualTo(content));
    }

    [Test]
    public async Task DeleteAsync_Should_Delete_File()
    {
        await using var stream = new MemoryStream(
            System.Text.Encoding.UTF8.GetBytes("delete"));

        await _provider.UploadAsync(
            stream,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidContentType);

        await _provider.DeleteAsync("delete.txt");

        var exists = await _provider.ExistsAsync("delete.txt");

        Assert.That(exists, Is.False);
    }

    [Test]
    public async Task MoveAsync_Should_Move_File()
    {
        await using var stream = new MemoryStream(
            Encoding.UTF8.GetBytes(TestData.TestConstants.ValidDescription));

        await _provider.UploadAsync(
            stream,
                TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidContentType);

        await _provider.MoveAsync(
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.DestinationFileName);

        var sourceExists = await _provider.ExistsAsync(
            TestData.TestConstants.ValidFileName);

        var destinationExists = await _provider.ExistsAsync(
            TestData.TestConstants.DestinationFileName);

        Assert.Multiple(() =>
        {
            Assert.That(sourceExists, Is.False);
            Assert.That(destinationExists, Is.True);
        });
    }

    [Test]
    public void Constructor_Should_Create_Storage_Directory()
    {
        var newPath = Path.Combine(
            Path.GetTempPath(),
            Guid.NewGuid().ToString());

        var options = new StorageOptions
        {
            LocalPath = newPath
        };

        var logger = Mock.Of<ILogger<LocalStorageProvider>>();

        _ = new LocalStorageProvider(options, logger);

        Assert.That(
            Directory.Exists(newPath),
            Is.True);

        Directory.Delete(newPath, true);
    }
    [Test]
    public void DownloadAsync_Should_Throw_When_File_Not_Found()
    {
        Assert.ThrowsAsync<InvalidOperationException>(
            async () =>
            {
                await _provider.DownloadAsync(
                    TestData.TestConstants.ValidFileName);
            });
    }
    [Test]
    public void MoveAsync_Should_Throw_When_Source_Missing()
    {
        Assert.ThrowsAsync<InvalidOperationException>(
            async () =>
            {
                await _provider.MoveAsync(
                    TestData.TestConstants.ValidFileName,
                    TestData.TestConstants.ValidFileName);
            });
    }
    [Test]
    public void UploadAsync_Should_Throw_When_Path_Invalid()
    {
        using var stream =
            new MemoryStream(
                System.Text.Encoding.UTF8.GetBytes(TestData.TestConstants.ValidDescription));


        Assert.ThrowsAsync<InvalidOperationException>(
            async () =>
            {
                await _provider.UploadAsync(
                    stream,
                    TestData.TestConstants.ValidFileName,
                    TestData.TestConstants.InvalidPath,
                    TestData.TestConstants.ValidContentType);
            });
    }
    [Test]
    public async Task DeleteAsync_Should_Not_Throw_When_File_Missing()
    {
        Assert.DoesNotThrowAsync(async () =>
        {
            await _provider.DeleteAsync(
                TestData.TestConstants.ValidFileName);
        });
    }
    [Test]
    public async Task UploadAsync_Should_Upload_File()
    {
        // Arrange
        await using var stream = new MemoryStream(
            System.Text.Encoding.UTF8.GetBytes(TestData.TestConstants.ValidDescription));

        // Act
        await _provider.UploadAsync(
            stream,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidFileName,
            TestData.TestConstants.ValidContentType);

        // Assert
        var exists = await _provider.ExistsAsync(
            TestData.TestConstants.ValidFileName);

        Assert.That(exists, Is.True);
    }
    [Test]
    public void DownloadAsync_ShouldThrow_WhenObjectDoesNotExist()
    {
        Assert.ThrowsAsync<InvalidOperationException>(
            async () =>
            {
                await _provider.DownloadAsync(
                    TestData.TestConstants.MissingFileName);
            });
    }
    [Test]
    public void MoveAsync_ShouldThrow_WhenSourceDoesNotExist()
    {
        Assert.ThrowsAsync<InvalidOperationException>(
            async () =>
            {
                await _provider.MoveAsync(
                    TestData.TestConstants.MissingFileName,
                    TestData.TestConstants.ValidFileName);
            });
    }
    [Test]
    public void DeleteAsync_ShouldThrow_WhenBucketInvalid()
    {
        var options = new StorageOptions
        {
            MinIO = new MinioOptions
            {
                Endpoint = TestData.TestConstants.MinioEndpoint,
                BucketName = TestData.TestConstants.InvalidBucketName,
                AccessKey = TestData.TestConstants.MinioAccessKey,
                SecretKey = TestData.TestConstants.MinioSecretKey,
                UseSSL = false
            }
        };

        var logger =
            Mock.Of<ILogger<MinioStorageProvider>>();

        var provider =
            new MinioStorageProvider(options, logger);


        Assert.ThrowsAsync<InvalidOperationException>(
            async () =>
            {
                await provider.DeleteAsync(TestData.TestConstants.ValidFileName);
            });
    }
}