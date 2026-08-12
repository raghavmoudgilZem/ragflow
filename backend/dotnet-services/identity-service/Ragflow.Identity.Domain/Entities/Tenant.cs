public class Tenant
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? LlmId { get; set; }

    public string? EmbeddingId { get; set; }

    public string? AsrId { get; set; }

    public string? ImageToTextId { get; set; }

    public string? RerankId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<UserTenant> UserTenants { get; set; }
       = new List<UserTenant>();
}