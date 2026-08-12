using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Ragflow.FileService.Domain.Entities;
using Ragflow.FileService.Infrastructure.Persistence;
using Ragflow.FileService.Infrastructure.Persistence.Repositories;
using FileEntity = Ragflow.FileService.Domain.Entities.File;

namespace Ragflow.FileService.Tests.Persistence.Repositories;

[TestFixture]
public class FileRepositoryTests
{
    private FileDbContext _context = null!;
    private FileRepository _repository = null!;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<FileDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new FileDbContext(options);

        _repository = new FileRepository(_context);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Test]
    public async Task GetFilesAsync_Should_Return_All_NonDeleted_Files()
    {
        // Arrange
        _context.Files.AddRange(
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File,
                IsDeleted = false
            },
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File,
                IsDeleted = false
            },
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File,
                IsDeleted = true
            });

        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilesAsync(
            null,
            null,
            1,
            10);

        // Assert
        Assert.That(result.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task GetFilesAsync_Should_Filter_By_ParentId()
    {
        // Arrange
        var parentId = Guid.NewGuid();

        _context.Files.AddRange(
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                ParentId = parentId,
                Type = FileType.File
            },
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                ParentId = Guid.NewGuid(),
                Type = FileType.File
            });

        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilesAsync(
            parentId,
            null,
            1,
            10);

        // Assert
        Assert.That(result.Count(), Is.EqualTo(1));
    }

    [Test]
    public async Task GetFilesAsync_Should_Filter_By_Search()
    {
        // Arrange
        _context.Files.AddRange(
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            },
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            });

        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilesAsync(
            null,
            TestData.TestConstants.ValidFileName,
            1,
            10);

        // Assert
        Assert.That(result.Count(), Is.EqualTo(2));
        Assert.That(result.First().Name, Is.EqualTo(TestData.TestConstants.ValidFileName));
    }

    [Test]
    public async Task GetFilesAsync_Should_Apply_Pagination()
    {
        // Arrange
        for (int i = 1; i <= 20; i++)
        {
            _context.Files.Add(new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            });
        }

        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilesAsync(
            null,
            null,
            2,
            5);

        // Assert
        Assert.That(result.Count(), Is.EqualTo(5));
    }

    [Test]
    public async Task GetTotalCountAsync_Should_Return_Total_Count()
    {
        // Arrange
        _context.Files.AddRange(
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            },
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            });

        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTotalCountAsync(
            null,
            null);

        // Assert
        Assert.That(result, Is.EqualTo(2));
    }

    [Test]
    public async Task GetTotalCountAsync_Should_Filter_By_Search()
    {
        // Arrange
        _context.Files.AddRange(
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            },
            new FileEntity
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            });

        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTotalCountAsync(
            null,
            TestData.TestConstants.ValidFileName);

        // Assert
        Assert.That(result, Is.EqualTo(2));
    }

    [Test]
    public async Task GetTotalCountAsync_Should_Filter_By_ParentId()
    {
        // Arrange
        var parentId = Guid.NewGuid();

        _context.Files.AddRange(
            new FileEntity
            {
                Id = Guid.NewGuid(),
                ParentId = parentId,
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            },
            new FileEntity
            {
                Id = Guid.NewGuid(),
                ParentId = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName,
                Type = FileType.File
            });

        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTotalCountAsync(
            parentId,
            null);

        // Assert
        Assert.That(result, Is.EqualTo(1));
    }
}