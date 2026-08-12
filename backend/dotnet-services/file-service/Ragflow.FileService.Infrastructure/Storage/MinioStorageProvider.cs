using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Options;

namespace Ragflow.FileService.Infrastructure.Storage;

public class MinioStorageProvider : IStorageProvider
{
    private readonly IMinioClient _client;
    private readonly MinioOptions _options;
    private readonly ILogger<MinioStorageProvider> _logger;

    public MinioStorageProvider(
        StorageOptions storageOptions,
        ILogger<MinioStorageProvider> logger)
    {
        _logger = logger;
        _options = storageOptions.MinIO;

        _client = new MinioClient()
            .WithEndpoint(_options.Endpoint)
            .WithCredentials(
                _options.AccessKey,
                _options.SecretKey)
            .WithSSL(_options.UseSSL)
            .Build();

        _logger.LogInformation(
            "MinioStorageProvider initialized. Endpoint: {Endpoint}, Bucket: {Bucket}",
            _options.Endpoint,
            _options.BucketName);
    }

    public async Task UploadAsync(
        Stream stream,
        string fileName,
        string objectKey,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "Uploading object '{ObjectKey}' to bucket '{Bucket}'.",
                objectKey,
                _options.BucketName);

            var bucketExists = await _client.BucketExistsAsync(
                new BucketExistsArgs()
                    .WithBucket(_options.BucketName),
                cancellationToken);

            if (!bucketExists)
            {
                _logger.LogInformation(
                    "Bucket '{Bucket}' does not exist. Creating bucket.",
                    _options.BucketName);

                await _client.MakeBucketAsync(
                    new MakeBucketArgs()
                        .WithBucket(_options.BucketName),
                    cancellationToken);

                _logger.LogInformation(
                    "Bucket '{Bucket}' created successfully.",
                    _options.BucketName);
            }

            await _client.PutObjectAsync(
                new PutObjectArgs()
                    .WithBucket(_options.BucketName)
                    .WithObject(objectKey)
                    .WithStreamData(stream)
                    .WithObjectSize(stream.Length)
                    .WithContentType(contentType),
                cancellationToken);

            _logger.LogInformation(
                "Successfully uploaded object '{ObjectKey}'.",
                objectKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to upload object '{ObjectKey}' to bucket '{Bucket}'.",
                objectKey,
                _options.BucketName);

            throw new InvalidOperationException(
            $"Failed to upload object '{objectKey}' to bucket '{_options.BucketName}'.",
            ex);
        }
    }

    public async Task<Stream> DownloadAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "Downloading object '{ObjectKey}' from bucket '{Bucket}'.",
                objectKey,
                _options.BucketName);

            var memoryStream = new MemoryStream();

            await _client.GetObjectAsync(
                new GetObjectArgs()
                    .WithBucket(_options.BucketName)
                    .WithObject(objectKey)
                    .WithCallbackStream(s =>
                    {
                        s.CopyTo(memoryStream);
                    }),
                cancellationToken);

            memoryStream.Position = 0;

            _logger.LogInformation(
                "Successfully downloaded object '{ObjectKey}'.",
                objectKey);

            return memoryStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to download object '{ObjectKey}'.",
                objectKey);

            throw new InvalidOperationException(
            $"Failed to download object '{objectKey}'.",
            ex);
        }
    }

    public async Task DeleteAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "Deleting object '{ObjectKey}' from bucket '{Bucket}'.",
                objectKey,
                _options.BucketName);

            await _client.RemoveObjectAsync(
                new RemoveObjectArgs()
                    .WithBucket(_options.BucketName)
                    .WithObject(objectKey),
                cancellationToken);

            _logger.LogInformation(
                "Successfully deleted object '{ObjectKey}'.",
                objectKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to delete object '{ObjectKey}'.",
                objectKey);

            throw new InvalidOperationException(
            $"Failed to delete object '{objectKey}'.",
            ex);
        }
    }

    public async Task<bool> ExistsAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _client.StatObjectAsync(
                new StatObjectArgs()
                    .WithBucket(_options.BucketName)
                    .WithObject(objectKey),
                cancellationToken);

            _logger.LogDebug(
                "Object '{ObjectKey}' exists.",
                objectKey);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex,
                "Object '{ObjectKey}' does not exist.",
                objectKey);

            return false;
        }
    }

    public async Task MoveAsync(
        string sourceObjectKey,
        string destinationObjectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "Moving object from '{Source}' to '{Destination}'.",
                sourceObjectKey,
                destinationObjectKey);

            await _client.CopyObjectAsync(
                new CopyObjectArgs()
                    .WithBucket(_options.BucketName)
                    .WithObject(destinationObjectKey)
                    .WithCopyObjectSource(
                        new CopySourceObjectArgs()
                            .WithBucket(_options.BucketName)
                            .WithObject(sourceObjectKey)),
                cancellationToken);

            await DeleteAsync(sourceObjectKey, cancellationToken);

            _logger.LogInformation(
                "Successfully moved object from '{Source}' to '{Destination}'.",
                sourceObjectKey,
                destinationObjectKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to move object from '{Source}' to '{Destination}'.",
                sourceObjectKey,
                destinationObjectKey);

            throw new InvalidOperationException(
            $"Failed to move object from '{sourceObjectKey}' to '{destinationObjectKey}'.",
            ex);
        }
    }
    
}