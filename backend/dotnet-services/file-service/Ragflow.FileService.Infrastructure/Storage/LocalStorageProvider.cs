using Microsoft.Extensions.Logging;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Options;

namespace Ragflow.FileService.Infrastructure.Storage;

public class LocalStorageProvider : IStorageProvider
{
    private readonly string _path;
    private readonly ILogger<LocalStorageProvider> _logger;

    public LocalStorageProvider(
        StorageOptions options,
        ILogger<LocalStorageProvider> logger)
    {
        _logger = logger;
        _path = options.LocalPath;

        if (!Directory.Exists(_path))
        {
            Directory.CreateDirectory(_path);

            _logger.LogInformation(
                "Created local storage directory at '{StoragePath}'.",
                _path);
        }

        _logger.LogInformation(
            "LocalStorageProvider initialized with storage path '{StoragePath}'.",
            _path);
    }

    private string GetFilePath(string objectKey)
    {
        return Path.Combine(_path, objectKey);
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
            var filePath = GetFilePath(objectKey);

            var directory = Path.GetDirectoryName(filePath);

            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory!);
            }

            _logger.LogInformation(
                "Uploading file '{ObjectKey}' to '{FilePath}'.",
                objectKey,
                filePath);

            await using var fileStream = new FileStream(
                filePath,
                FileMode.Create,
                FileAccess.Write);

            await stream.CopyToAsync(fileStream, cancellationToken);

            _logger.LogInformation(
                "Successfully uploaded file '{ObjectKey}'.",
                objectKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to upload file '{ObjectKey}'.",
                objectKey);

            throw new InvalidOperationException(
                $"Failed to upload object '{objectKey}'.",
                ex);
        }
    }

    public Task<Stream> DownloadAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var filePath = GetFilePath(objectKey);

            _logger.LogInformation(
                "Downloading file '{ObjectKey}' from '{FilePath}'.",
                objectKey,
                filePath);

            Stream stream = new FileStream(
                filePath,
                FileMode.Open,
                FileAccess.Read);

            _logger.LogInformation(
                "Successfully opened file '{ObjectKey}'.",
                objectKey);

            return Task.FromResult(stream);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to download file '{ObjectKey}'.",
                objectKey);

            throw new InvalidOperationException(
               $"Failed to download file '{objectKey}'.",
               ex);
        }
    }

    public Task DeleteAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var filePath = GetFilePath(objectKey);

            _logger.LogInformation(
                "Deleting file '{ObjectKey}'.",
                objectKey);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);

                _logger.LogInformation(
                    "Successfully deleted file '{ObjectKey}'.",
                    objectKey);
            }
            else
            {
                _logger.LogWarning(
                    "File '{ObjectKey}' not found for deletion.",
                    objectKey);
            }

            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to delete file '{ObjectKey}'.",
                objectKey);

            throw new InvalidOperationException(
            $"Failed to delete file '{objectKey}'.",
            ex);
        }
    }

    public Task<bool> ExistsAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var filePath = GetFilePath(objectKey);

            var exists = File.Exists(filePath);

            _logger.LogInformation(
                "Existence check for '{ObjectKey}': {Exists}.",
                objectKey,
                exists);

            return Task.FromResult(exists);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to check existence of file '{ObjectKey}'.",
                objectKey);

            throw new InvalidOperationException(
            $"Failed to check existence of file '{objectKey}'.",
            ex);
        }
    }

    public Task MoveAsync(
        string sourceObjectKey,
        string destinationObjectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var sourcePath = GetFilePath(sourceObjectKey);
            var destinationPath = GetFilePath(destinationObjectKey);

            var directory = Path.GetDirectoryName(destinationPath);

            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory!);
            }

            _logger.LogInformation(
                "Moving file from '{Source}' to '{Destination}'.",
                sourceObjectKey,
                destinationObjectKey);

            File.Move(sourcePath, destinationPath);

            _logger.LogInformation(
                "Successfully moved file from '{Source}' to '{Destination}'.",
                sourceObjectKey,
                destinationObjectKey);

            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to move file from '{Source}' to '{Destination}'.",
                sourceObjectKey,
                destinationObjectKey);

            throw new InvalidOperationException(
            $"Failed to move file from '{sourceObjectKey}' to '{destinationObjectKey}'.",
            ex);
        }
    }
}