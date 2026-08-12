namespace Admin.UnitTests.TestData;

public static class TestConstants
{
    public const string Authorization = "Bearer jwt-token";
    public const string UserNotFound = "User not found.";

    public const string GetUsersFailed = "Failed to retrieve users.";
    public const string GetUserFailed = "Failed to retrieve user details.";
    public const string GetUserTenantsFailed = "Failed to retrieve user tenants.";
    public const string ActiveStatus = "Active";
    public const string DisabledStatus = "Disabled";

    public const string EnableUserFailed = "Failed to enable user.";
    public const string DisableUserFailed = "Failed to disable user.";

    public const string InvalidUserId = "Invalid user id.";
    public const string InvalidGuid = "invalid-guid";

    public const string TenantOneName = "Tenant One";
    public const string AdminRole = "Admin";
}
