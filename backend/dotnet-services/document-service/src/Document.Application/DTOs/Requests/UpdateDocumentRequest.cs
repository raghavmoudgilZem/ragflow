using Document.Application.DTOs.Common;

namespace Document.Application.DTOs.Requests;

public sealed class UpdateDocumentRequest
{
    /// <summary>
    /// Updated document name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Updated description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Parser selected by user.
    /// </summary>
    public string ParserId { get; set; } = "default";

    /// <summary>
    /// Parse document immediately after update.
    /// </summary>
    public bool ParseImmediately { get; set; }

    /// <summary>
    /// Optional file replacement.
    /// Leave null if only updating metadata.
    /// </summary>
    public FileUploadRequest? File { get; set; }
}