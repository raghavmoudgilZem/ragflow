namespace Document.Application.DTOs.Responses;

public sealed class ParseDocumentsResponse
{
    /// <summary>
    /// Number of documents successfully submitted for parsing.
    /// </summary>
    public int SuccessCount { get; set; }

    /// <summary>
    /// Number of documents that failed validation or submission.
    /// </summary>
    public int FailedCount { get; set; }

    /// <summary>
    /// Successfully submitted document ids.
    /// </summary>
    public List<Guid> SuccessfulDocumentIds { get; set; } = new();

    /// <summary>
    /// Documents that failed to be submitted.
    /// </summary>
    public List<ParseDocumentFailure> FailedDocuments { get; set; } = new();

    public string Message { get; set; }
        = "Documents submitted for parsing successfully.";
}



public sealed class ParseDocumentFailure
{
    public Guid DocumentId { get; set; }

    public string Reason { get; set; } = string.Empty;
}