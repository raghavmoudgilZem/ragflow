using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Ragflow.FileService.Domain.Common;
using Ragflow.FileService.Infrastructure.Persistence.Repositories;

namespace Ragflow.FileService.Tests.Persistence;

public class TestEntity : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
}

public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options)
        : base(options)
    {
    }

    public DbSet<TestEntity> TestEntities => Set<TestEntity>();
}


[TestFixture]
public class GenericRepositoryTests
{
    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new TestDbContext(options);
        _repository = new GenericRepository<TestEntity>(_context);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }
    private TestDbContext _context = null!;
    private GenericRepository<TestEntity> _repository = null!;

    [Test]
    public async Task AddAsync_ShouldAddEntity()
    {
        var entity = new TestEntity { Name = "File1" };

        await _repository.AddAsync(entity);
        await _context.SaveChangesAsync();

        Assert.That(_context.TestEntities.Count(), Is.EqualTo(1));
    }

    [Test]
    public async Task GetByIdAsync_ShouldReturnEntity()
    {
        var entity = new TestEntity { Name = TestData.TestConstants.ValidFileName };

        _context.TestEntities.Add(entity);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(entity.Id);

        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Name, Is.EqualTo(TestData.TestConstants.ValidFileName));
    }

    [Test]
    public async Task GetByIdAsync_ShouldReturnNull_WhenDeleted()
    {
        var entity = new TestEntity
        {
            Name = TestData.TestConstants.ValidFileName,
            IsDeleted = true
        };

        _context.TestEntities.Add(entity);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(entity.Id);

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task GetAllAsync_ShouldIgnoreDeletedEntities()
    {
        _context.TestEntities.Add(new TestEntity { Name = TestData.TestConstants.ValidFileName });
        _context.TestEntities.Add(new TestEntity { Name = TestData.TestConstants.ValidFileName, IsDeleted = true });

        await _context.SaveChangesAsync();

        var result = await _repository.GetAllAsync();

        Assert.That(result.Count(), Is.EqualTo(1));
    }

    [Test]
    public async Task ExistsAsync_ShouldReturnTrue()
    {
        _context.TestEntities.Add(new TestEntity { Name = TestData.TestConstants.ValidFileName });
        await _context.SaveChangesAsync();

        var exists = await _repository.ExistsAsync(x => x.Name == TestData.TestConstants.ValidFileName);

        Assert.That(exists, Is.True);
    }

    [Test]
    public async Task ExistsAsync_ShouldReturnFalse()
    {
        var exists = await _repository.ExistsAsync(x => x.Name == TestData.TestConstants.MissingFileName);

        Assert.That(exists, Is.False);
    }

[Test]
public async Task FindAsync_ShouldReturnMatchingEntities()
{
    _context.TestEntities.Add(new TestEntity
    {
        Name = TestData.TestConstants.ValidFileName
    });

    _context.TestEntities.Add(new TestEntity
    {
        Name = TestData.TestConstants.AnotherFileName
    });

    await _context.SaveChangesAsync();

    var result = await _repository.FindAsync(
        x => x.Name == TestData.TestConstants.ValidFileName);

    Assert.That(result.Count(), Is.EqualTo(1));
}

    [Test]
    public async Task Update_ShouldUpdateEntity()
    {
        var entity = new TestEntity { Name = TestData.TestConstants.ValidFileName };

        _context.TestEntities.Add(entity);
        await _context.SaveChangesAsync();

        entity.Name = TestData.TestConstants.ValidFileName;

        _repository.Update(entity);
        await _context.SaveChangesAsync();

        Assert.That(_context.TestEntities.First().Name, Is.EqualTo(TestData.TestConstants.ValidFileName));
    }

    [Test]
    public async Task Delete_ShouldSoftDeleteEntity()
    {
        var entity = new TestEntity { Name = TestData.TestConstants.ValidFileName };

        _context.TestEntities.Add(entity);
        await _context.SaveChangesAsync();

        _repository.Delete(entity);
        await _context.SaveChangesAsync();

        Assert.That(entity.IsDeleted, Is.True);
    }

    [Test]
    public async Task AddRangeAsync_ShouldAddEntities()
    {
        var entities = new[]
        {
            new TestEntity { Name = TestData.TestConstants.ValidFileName },
            new TestEntity { Name = TestData.TestConstants.ValidFileName }
        };

        await _repository.AddRangeAsync(entities);
        await _context.SaveChangesAsync();

        Assert.That(_context.TestEntities.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task DeleteRange_ShouldSoftDeleteAndUpdateDatabase()
    {
        var entities = new[]
        {
            new TestEntity { Name = TestData.TestConstants.ValidFileName },
            new TestEntity { Name = TestData.TestConstants.ValidFileName }
        };

        _context.TestEntities.AddRange(entities);
        await _context.SaveChangesAsync();

        _repository.DeleteRange(entities);
        await _context.SaveChangesAsync();

        var deletedEntities = await _context.TestEntities.ToListAsync();

        Assert.That(deletedEntities.All(x => x.IsDeleted), Is.True);
    }

    [Test]
    public async Task UpdateRange_ShouldUpdateEntities()
    {
        var entities = new[]
        {
        new TestEntity { Name = TestData.TestConstants.ValidFileName },
        new TestEntity { Name = TestData.TestConstants.ValidFileName }
    };

        _context.TestEntities.AddRange(entities);
        await _context.SaveChangesAsync();

        entities[0].Name = TestData.TestConstants.ValidFileName;
        entities[1].Name = TestData.TestConstants.ValidFileName;

        _repository.UpdateRange(entities);
        await _context.SaveChangesAsync();

        var result = await _context.TestEntities.ToListAsync();

        Assert.That(result[0].Name, Is.EqualTo(TestData.TestConstants.ValidFileName));
        Assert.That(result[1].Name, Is.EqualTo(TestData.TestConstants.ValidFileName));
    }

    [Test]
    public void GetQueryable_ShouldReturnQueryable()
    {
        var result = _repository.GetQueryable();

        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<IQueryable<TestEntity>>());
    }
}