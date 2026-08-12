using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.TestData;

public static class PaginationDtos
{
    public static PaginationDto Valid()
    {
        return new PaginationDto
        {
            Page = 2,
            PageSize = 20,
            TotalRecords = 1,
            TotalPages = 1,
        };
    }
}
