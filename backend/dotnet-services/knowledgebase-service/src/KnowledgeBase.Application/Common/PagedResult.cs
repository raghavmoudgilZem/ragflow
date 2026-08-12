namespace KnowledgeBase.Application.Common;

public sealed class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; init; } = [];

    public int PageNumber { get; init; }

    public int PageSize { get; init; }

    public int TotalRecords { get; init; }

    public int TotalPages =>
        TotalRecords == 0
            ? 0
            : (int)Math.Ceiling((double)TotalRecords / PageSize);
}