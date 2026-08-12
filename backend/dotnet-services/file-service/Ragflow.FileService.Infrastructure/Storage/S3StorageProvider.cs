using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Options;

namespace Ragflow.FileService.Infrastructure.Storage;

public class S3StorageProvider : IStorageProvider
{
    private readonly IAmazonS3 _client;
    private readonly S3Options _options;
    private readonly ILogger<S3StorageProvider> _logger;

        public S3StorageProvider(
        IAmazonS3 client,
        StorageOptions storageOptions,
        ILogger<S3StorageProvider> logger)
    {
        _client = client;
        _logger = logger;
        _options = storageOptions.S3;

        _logger.LogInformation(
            "S3StorageProvider initialized. Endpoint: {Endpoint}, Bucket: {Bucket}",
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

            var request = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = objectKey,
                InputStream = stream,
                ContentType = contentType
            };

            await _client.PutObjectAsync(request, cancellationToken);

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

            var response = await _client.GetObjectAsync(
                _options.BucketName,
                objectKey,
                cancellationToken);

            var memory = new MemoryStream();

            await response.ResponseStream.CopyToAsync(
                memory,
                cancellationToken);

            memory.Position = 0;

            _logger.LogInformation(
                "Successfully downloaded object '{ObjectKey}'.",
                objectKey);

            return memory;
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

            await _client.DeleteObjectAsync(
                _options.BucketName,
                objectKey,
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
            await _client.GetObjectMetadataAsync(
                _options.BucketName,
                objectKey,
                cancellationToken);

            _logger.LogInformation(
                "Object '{ObjectKey}' exists.",
                objectKey);

            return true;
        }
        catch (AmazonS3Exception ex)
            when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogDebug(
                ex,
                "Object '{ObjectKey}' existence check returned {Exists}.",
                objectKey,
                false);

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error checking existence of object '{ObjectKey}'.",
                objectKey);

            throw new InvalidOperationException(
           $"Error checking existence of object '{objectKey}'.",
            ex);
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
                new CopyObjectRequest
                {
                    SourceBucket = _options.BucketName,
                    SourceKey = sourceObjectKey,
                    DestinationBucket = _options.BucketName,
                    DestinationKey = destinationObjectKey
                },
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