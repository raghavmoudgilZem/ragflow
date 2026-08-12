namespace KnowledgeBase.Application.DTOs.Dataset;

public sealed class GetDatasetsRequest
{
    private const int DefaultPageNumber = 1;
    private const int DefaultPageSize = 10;

    public int PageNumber { get; init; } = DefaultPageNumber;

    public int PageSize { get; init; } = DefaultPageSize;

    public string? Search { get; init; }

    public string SortBy { get; init; } = "CreatedAt";

    public string SortOrder { get; init; } = "desc";
}