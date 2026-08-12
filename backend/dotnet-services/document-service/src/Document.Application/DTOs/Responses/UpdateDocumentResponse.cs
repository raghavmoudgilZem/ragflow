namespace Document.Application.DTOs.Responses;

public sealed class UpdateDocumentResponse
{
    public Guid Id { get; set; }

    public string Message { get; set; }
        = "Document updated successfully.";
}