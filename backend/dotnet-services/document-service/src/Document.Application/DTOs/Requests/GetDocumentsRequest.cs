using Document.Domain.Enums;

namespace Document.Application.DTOs.Requests;

public sealed class GetDocumentsRequest
{
    /// <summary>
    /// Knowledge Base Id
    /// </summary>
    public Guid KnowledgeBaseId { get; set; }

    /// <summary>
    /// Search by document name.
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Filter by document status.
    /// </summary>
    public DocumentStatus? Status { get; set; }

    /// <summary>
    /// Field used for sorting.
    /// Default = CreatedAt
    /// </summary>
    public string SortBy { get; set; } = "CreatedAt";

    /// <summary>
    /// asc / desc
    /// Default = desc
    /// </summary>
    public string SortOrder { get; set; } = "desc";

    /// <summary>
    /// Page Number
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Page Size
    /// </summary>
    public int PageSize { get; set; } = 20;
}