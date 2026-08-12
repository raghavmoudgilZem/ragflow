public interface IStorageProvider
{
    Task UploadAsync(
        Stream stream,
        string fileName,
        string objectKey,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<Stream> DownloadAsync(
        string objectKey,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string objectKey,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        string objectKey,
        CancellationToken cancellationToken = default);

    Task MoveAsync(
        string sourceObjectKey,
        string destinationObjectKey,
        CancellationToken cancellationToken = default);
}