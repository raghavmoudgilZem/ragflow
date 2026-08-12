using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.TestData;

public static class PagedUserResponses
{
    public static PagedUserResponseDto Valid()
    {
        return new() { Items = UserListItems.ValidList(), Pagination = PaginationDtos.Valid() };
    }
}
