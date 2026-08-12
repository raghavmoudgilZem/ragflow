using KnowledgeBase.Application.DTOs.Dataset;

namespace KnowledgeBase.Application.UnitTests.TestData;

public static class GetDatasetRequests
{
    public static GetDatasetsRequest Valid()
    {
        return new GetDatasetsRequest
        {
            PageNumber = 1,
            PageSize = 10,
            Search = string.Empty,
            SortBy = "CreatedAt",
            SortOrder = "desc"
        };
    }

    public static GetDatasetsRequest WithSearch(string search)
    {
        return new GetDatasetsRequest
        {
            PageNumber = 1,
            PageSize = 10,
            Search = search,
            SortBy = "CreatedAt",
            SortOrder = "desc"
        };
    }

    public static GetDatasetsRequest FirstPage()
    {
        return new GetDatasetsRequest
        {
            PageNumber = 1,
            PageSize = 10,
            Search = string.Empty,
            SortBy = "CreatedAt",
            SortOrder = "desc"
        };
    }

    public static GetDatasetsRequest SecondPage()
    {
        return new GetDatasetsRequest
        {
            PageNumber = 2,
            PageSize = 10,
            Search = string.Empty,
            SortBy = "CreatedAt",
            SortOrder = "desc"
        };
    }

    public static GetDatasetsRequest InvalidPageNumber()
    {
        return new GetDatasetsRequest
        {
            PageNumber = 0,
            PageSize = 10,
            Search = string.Empty,
            SortBy = "CreatedAt",
            SortOrder = "desc"
        };
    }

    public static GetDatasetsRequest InvalidPageSize()
    {
        return new GetDatasetsRequest
        {
            PageNumber = 1,
            PageSize = 0,
            Search = string.Empty,
            SortBy = "CreatedAt",
            SortOrder = "desc"
        };
    }
}