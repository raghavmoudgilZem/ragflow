
using KnowledgeBaseEntity = KnowledgeBase.Domain.Entities.KnowledgeBase;

public static class DatasetTestData
{
    public static KnowledgeBaseEntity CreateKnowledgeBase()
    {
        return new KnowledgeBaseEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "HR Policies",
            Description = "HR Documents",
            Language = "English",
            Permission = "Me",
            EmbeddingModel = "text-embedding-3-small",
            ParserId = "default",
            ChunkMethod = "General",
            Status = "Active",
            CreatedBy = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            CreatedAt = DateTime.UtcNow
        };
    }
}