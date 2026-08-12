
namespace Ragflow.FileService.Core.Options;
public class S3Options
{
    public string BucketName { get; set; } = string.Empty;

    public string Endpoint { get; set; } = string.Empty;

    public string Region { get; set; } = string.Empty;

    public string AccessKey { get; set; } = string.Empty;

    public string SecretKey { get; set; } = string.Empty;

    public bool UseSSL { get; set; }
}