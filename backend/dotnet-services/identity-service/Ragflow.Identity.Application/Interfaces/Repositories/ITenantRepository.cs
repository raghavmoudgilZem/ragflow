public interface ITenantRepository
{
    Task AddAsync(
        Tenant tenant,
        CancellationToken cancellationToken);

    Task<Tenant?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);
}