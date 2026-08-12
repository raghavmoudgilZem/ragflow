using KnowledgeBase.Application.DTOs.Dataset;

namespace KnowledgeBase.Application.UnitTests.TestData;

public static class UpdateDatasetRequests
{
    public static UpdateDatasetRequest Valid()
    {
        return new UpdateDatasetRequest
        {
            Name = "Updated HR Policies",
            Description = "Updated HR policy documents",
            Language = "English",
            Permission = "Me",
            EmbeddingModel = "text-embedding-3-small",
            ParserId = "default",
            ChunkMethod = "General"
        };
    }

    public static UpdateDatasetRequest ValidWithDifferentName()
    {
        return new UpdateDatasetRequest
        {
            Name = "Finance Documents",
            Description = "Finance department documents",
            Language = "English",
            Permission = "Me",
            EmbeddingModel = "text-embedding-3-small",
            ParserId = "default",
            ChunkMethod = "General"
        };
    }

    public static UpdateDatasetRequest Invalid()
    {
        return new UpdateDatasetRequest
        {
            Name = string.Empty,
            Description = "Invalid dataset",
            Language = string.Empty,
            Permission = string.Empty,
            EmbeddingModel = string.Empty,
            ParserId = string.Empty,
            ChunkMethod = string.Empty
        };
    }



    public static UpdateDatasetRequest OnlyDescriptionChanged()
    {
        return new UpdateDatasetRequest
        {
            Name = "HR Policies",
            Description = "Updated Description Only",
            Language = "English",
            Permission = "Me",
            EmbeddingModel = "text-embedding-3-small",
            ParserId = "default",
            ChunkMethod = "General"
        };
    }

    public static UpdateDatasetRequest OnlyNameChanged()
    {
        return new UpdateDatasetRequest
        {
            Name = "Updated Dataset Name",
            Description = "HR Documents",
            Language = "English",
            Permission = "Me",
            EmbeddingModel = "text-embedding-3-small",
            ParserId = "default",
            ChunkMethod = "General"
        };
    }
}