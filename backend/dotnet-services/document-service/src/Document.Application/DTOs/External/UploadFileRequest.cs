namespace Document.Application.DTOs.External;

public sealed class UploadFileRequest
{
    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public Stream Content { get; set; } = Stream.Null;

    public long Length { get; set; }
}