public interface IRefreshTokenStore
{
    Task SaveAsync(
        string token,
        Guid userId,
        TimeSpan expiry);

    Task<Guid?> GetUserIdAsync(
        string token);

    Task DeleteAsync(
        string token);
}