namespace Document.Application.DTOs.Responses;

public sealed class PagedResponse<T>
{
    public IReadOnlyCollection<T> Items { get; set; }
        = Array.Empty<T>();

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}