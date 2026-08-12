public interface IRefreshTokenRepository
{
    Task AddAsync(
        RefreshToken token,
        CancellationToken cancellationToken);

    Task<RefreshToken?> GetByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken);

    Task UpdateAsync(
        RefreshToken token,
        CancellationToken cancellationToken);

         Task RevokeAsync(
        string tokenHash,
        CancellationToken cancellationToken);
}