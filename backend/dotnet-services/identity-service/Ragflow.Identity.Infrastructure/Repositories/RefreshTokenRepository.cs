
using Microsoft.EntityFrameworkCore;

public sealed class RefreshTokenRepository
    : IRefreshTokenRepository
{
    private readonly ApplicationDbContext _db;

    public RefreshTokenRepository(
        ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        RefreshToken token,
        CancellationToken cancellationToken)
    {
        await _db.RefreshTokens.AddAsync(
            token,
            cancellationToken);

        await _db.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<RefreshToken?>
        GetByTokenHashAsync(
            string tokenHash,
            CancellationToken cancellationToken)
    {
        return await _db.RefreshTokens
            .FirstOrDefaultAsync(
                x => x.TokenHash == tokenHash,
                cancellationToken);
    }
    public async Task RevokeAsync(
        string tokenHash,
        CancellationToken cancellationToken)
    {
        var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(
                x => x.TokenHash == tokenHash,
                cancellationToken);

        if (token == null)
            return;

        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(
            cancellationToken);
    }
    public async Task UpdateAsync(
        RefreshToken token,
        CancellationToken cancellationToken)
    {
        _db.RefreshTokens.Update(token);

        await _db.SaveChangesAsync(
            cancellationToken);
    }
}