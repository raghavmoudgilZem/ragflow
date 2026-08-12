namespace Document.Application.DTOs.External;

public sealed class UploadFileResponse
{
    public Guid FileId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public string ContentType { get; set; } = string.Empty;
}