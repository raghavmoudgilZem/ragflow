using System.ComponentModel.DataAnnotations;

namespace Ragflow.AdminService.Domain.DTOs;

public sealed class GetUsersRequestDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0.")]
    public int Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; set; } = 20;

    [StringLength(100, ErrorMessage = "Search cannot exceed 100 characters.")]
    public string? Search { get; set; }

    [RegularExpression(
        "^(Active|Inactive)?$",
        ErrorMessage = "Status must be either 'Active' or 'Inactive'."
    )]
    public string? Status { get; set; }

    public Guid? TenantId { get; set; }

    [RegularExpression(
        "^(Name|Email|CreatedAt|Status)?$",
        ErrorMessage = "SortBy must be one of: Name, Email, CreatedAt, Status."
    )]
    public string? SortBy { get; set; }

    [RegularExpression("^(asc|desc)?$", ErrorMessage = "SortOrder must be either 'asc' or 'desc'.")]
    public string? SortOrder { get; set; }
}
