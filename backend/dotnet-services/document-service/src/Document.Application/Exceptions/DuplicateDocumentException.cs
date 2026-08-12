namespace Document.Application.Exceptions;

public sealed class DuplicateDocumentException : Exception
{
    public DuplicateDocumentException(string documentName)
        : base($"Document '{documentName}' already exists.")
    {
    }
}