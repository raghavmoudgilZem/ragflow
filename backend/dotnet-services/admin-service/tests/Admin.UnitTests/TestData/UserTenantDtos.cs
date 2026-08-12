using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.TestData;

public static class UserTenantDtos
{
    public static List<UserTenantDto> Valid()
    {
        return
        [
            new UserTenantDto
            {
                TenantId = Guid.NewGuid(),
                TenantName = "Tenant One",
                Role = "Admin",
            },
            new UserTenantDto
            {
                TenantId = Guid.NewGuid(),
                TenantName = "Tenant Two",
                Role = "Member",
            },
        ];
    }
}
