using StackExchange.Redis;

public sealed class RedisRefreshTokenStore
    : IRefreshTokenStore
{
    private readonly IDatabase _db;

    public RedisRefreshTokenStore(
        IConnectionMultiplexer redis)
    {
        _db = redis.GetDatabase();
    }

    public async Task SaveAsync(
        string token,
        Guid userId,
        TimeSpan expiry)
    {
        await _db.StringSetAsync(
            $"refresh:{token}",
            userId.ToString(),
            expiry);
    }

    public async Task<Guid?> GetUserIdAsync(
        string token)
    {
        var value =
            await _db.StringGetAsync(
                $"refresh:{token}");

        if (!value.HasValue)
            return null;

       return Guid.Parse((string)value!);
    }

    public async Task DeleteAsync(
        string token)
    {
        await _db.KeyDeleteAsync(
            $"refresh:{token}");
    }
}