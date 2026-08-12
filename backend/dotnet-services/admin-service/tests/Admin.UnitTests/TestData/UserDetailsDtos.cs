using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.TestData;

public static class UserDetailsDtos
{
    public static UserDetailsDto Valid(Guid? id = null)
    {
        return new UserDetailsDto
        {
            Id = id ?? Guid.NewGuid(),
            Email = "john@test.com",
            Name = "John Doe",
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            Roles = ["Owner"],
        };
    }
}
