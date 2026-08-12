namespace Ragflow.FileService.Core.DTOs.Requests;

public class GetFilesRequest
{
    public Guid? ParentId { get; set; }

    public string? Search { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }

    public string? SortOrder { get; set; } = "ASC";
}