namespace KnowledgeBase.Application.Exceptions;

public sealed class DuplicateDatasetException : Exception
{
    public DuplicateDatasetException(string name)
        : base($"Dataset '{name}' already exists.")
    {
    }
}