using KnowledgeBase.Application.DTOs.Dataset;

public static class CreateDatasetRequests
{
    public static CreateDatasetRequest Valid()
    {
        return new CreateDatasetRequest
        {
            Name = "HR Policies",
            Description = "HR Docs",
            Language = "English",
            Permission = "Me",
            EmbeddingModel = "text-embedding-3-small",
            ParserId = "default",
            ChunkMethod = "General"
        };
    }
}