using Document.Application.DTOs.External;

namespace Document.Application.Tests.TestData;

public static class KnowledgeBases
{
    public static KnowledgeBaseDto Valid()
    {
        return new KnowledgeBaseDto
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "HR KB",
            Status = "true"
        };
    }
}