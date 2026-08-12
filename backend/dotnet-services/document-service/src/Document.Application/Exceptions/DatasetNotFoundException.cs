namespace Document.Application.Exceptions;

public sealed class DatasetNotFoundException : Exception
{
    public DatasetNotFoundException(Guid datasetId)
        : base($"Knowledge Base '{datasetId}' was not found.")
    {
    }
}