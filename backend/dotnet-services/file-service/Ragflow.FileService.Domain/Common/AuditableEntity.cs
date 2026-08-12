namespace Ragflow.FileService.Domain.Common;

public abstract class AuditableEntity : BaseEntity
{
    public Guid? TenantId { get; set; }

    public Guid? OwnerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}