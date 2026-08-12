namespace Ragflow.FileService.Core.Options;

public class StorageOptions
{
    public const string SectionName = "Storage";
    public string Provider { get; set; } = string.Empty;

    public string LocalPath { get; set; } = string.Empty;

    public MinioOptions MinIO { get; set; } = new();

    public S3Options S3 { get; set; } = new();
}
