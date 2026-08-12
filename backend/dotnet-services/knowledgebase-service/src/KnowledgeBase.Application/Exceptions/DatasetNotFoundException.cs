namespace KnowledgeBase.Application.Exceptions;

public sealed class DatasetNotFoundException : Exception
{
    public DatasetNotFoundException(Guid datasetId)
        : base($"Dataset '{datasetId}' was not found.")
    {
    }
}