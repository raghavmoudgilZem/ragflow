namespace Document.Application.DTOs.Requests;

public sealed class ParseDocumentsRequest
{
    /// <summary>
    /// One or more document ids to parse.
    /// </summary>
    public List<Guid> DocumentIds { get; set; } = new();
}