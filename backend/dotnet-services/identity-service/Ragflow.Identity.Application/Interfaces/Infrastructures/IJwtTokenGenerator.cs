public interface IJwtTokenGenerator
{
    string GenerateAccessToken(
        Guid userId,
        string email,
        Guid tenantId,
        string role,
        string status);

    string GenerateRefreshToken();
}