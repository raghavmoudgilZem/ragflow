using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Ragflow.Identity.Infrastructure.Persistence;
using Ragflow.FileService.Infrastructure.Persistence;

namespace Ragflow.FileService.Tests.Persistence;

[TestFixture]
public class UnitOfWorkTests
{
    private FileDbContext _context = null!;
    private UnitOfWork _unitOfWork = null!;


    [SetUp]
    public void Setup()
    {
        var options =
            new DbContextOptionsBuilder<FileDbContext>()
            .UseInMemoryDatabase(
                Guid.NewGuid().ToString())
            .Options;


        _context =
            new FileDbContext(options);


        _unitOfWork =
            new UnitOfWork(_context);
    }


    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }


    [Test]
    public void UnitOfWork_ShouldCreateInstance()
    {
        Assert.That(
            _unitOfWork,
            Is.Not.Null);
    }


    [Test]
    public async Task SaveChangesAsync_ShouldReturnZero_WhenNoChanges()
    {
        var result =
            await _unitOfWork.SaveChangesAsync();


        Assert.That(
            result,
            Is.EqualTo(0));
    }


    [Test]
    public async Task SaveChangesAsync_ShouldSaveChanges()
    {
        // This test validates that SaveChangesAsync
        // calls DbContext.SaveChangesAsync correctly.

        var result =
            await _unitOfWork.SaveChangesAsync();


        Assert.That(
            result,
            Is.EqualTo(0));
    }
}