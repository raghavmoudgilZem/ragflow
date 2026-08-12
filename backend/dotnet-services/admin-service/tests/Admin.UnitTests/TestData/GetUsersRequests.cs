using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.TestData;

public static class GetUsersRequests
{
    public static GetUsersRequestDto Valid()
    {
        return new GetUsersRequestDto
        {
            Page = 1,
            PageSize = 10,
            Search = "john",
            SortBy = "Email",
            SortOrder = "asc",
        };
    }
}
