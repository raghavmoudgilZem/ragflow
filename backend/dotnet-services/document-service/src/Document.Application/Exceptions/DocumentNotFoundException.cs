namespace Document.Application.Exceptions;

public sealed class DocumentNotFoundException : Exception
{
    public DocumentNotFoundException(Guid documentId)
        : base($"Document '{documentId}' was not found.")
    {
    }
}