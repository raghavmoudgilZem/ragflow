using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Ragflow.FileService.Infrastructure.Persistence;

namespace Ragflow.FileService.Tests.Persistence;

[TestFixture]
public class FileDbContextTests
{
    private FileDbContext _context = null!;


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
    }


    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }


    [Test]
    public void FileDbContext_ShouldCreateInstance()
    {
        Assert.That(
            _context,
            Is.Not.Null);
    }


    [Test]
    public void OnModelCreating_ShouldExecuteSuccessfully()
    {
        var model =
            _context.Model;


        Assert.That(
            model,
            Is.Not.Null);
    }
}