namespace Document.Application.DTOs.Responses;

public sealed class DeleteDocumentsResponse
{
    public int SuccessCount { get; set; }

    public int FailedCount { get; set; }

    public List<Guid> SuccessfulDocumentIds { get; set; } = [];

    public List<DeleteDocumentFailure> FailedDocuments { get; set; } = [];
}

public sealed class DeleteDocumentFailure
{
    public Guid DocumentId { get; set; }

    public string Reason { get; set; } = string.Empty;
}