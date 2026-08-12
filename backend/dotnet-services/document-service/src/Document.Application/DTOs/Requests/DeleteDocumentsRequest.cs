namespace Document.Application.DTOs.Requests;
public sealed class DeleteDocumentsRequest
{
    public List<Guid> DocumentIds { get; set; } = new();
}