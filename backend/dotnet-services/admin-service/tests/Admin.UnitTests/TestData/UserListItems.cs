using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.TestData;

public static class UserListItems
{
    public static UserListItemDto Valid()
    {
        return new()
        {
            Id = Guid.NewGuid(),
            Name = "John Doe",
            Email = "john@ragflow.com",
            Status = "Active",
        };
    }

    public static List<UserListItemDto> ValidList()
    {
        return [Valid()];
    }
}
