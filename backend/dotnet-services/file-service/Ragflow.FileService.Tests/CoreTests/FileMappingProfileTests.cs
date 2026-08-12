using AutoMapper;
using NUnit.Framework;
using Ragflow.FileService.Core.Mappings;
using Ragflow.FileService.Core.DTOs.Responses;
using FileEntity = Ragflow.FileService.Domain.Entities.File;
using Ragflow.FileService.Domain.Entities;

namespace Ragflow.FileService.Tests.Mappings;

[TestFixture]
public class FileMappingProfileTests
{
    private IMapper _mapper = null!;

    [OneTimeSetUp]
    public void Setup()
    {
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<FileMappingProfile>();
        });

        configuration.AssertConfigurationIsValid();

        _mapper = configuration.CreateMapper();
    }

    [Test]
    public void FileMappingProfile_Should_Have_Valid_Configuration()
    {
        // Arrange
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<FileMappingProfile>();
        });

        // Assert
        Assert.DoesNotThrow(() => configuration.AssertConfigurationIsValid());
    }

    [Test]
    public void Should_Map_FileEntity_To_FileResponse()
    {
        // Arrange
        var file = new FileEntity
        {
            Id = Guid.NewGuid(),
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            ParentId = Guid.NewGuid(),
            Description = TestData.TestConstants.ValidDescription,
            CurrentVersion = 1,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.NewGuid(),
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = Guid.NewGuid()
        };

        // Act
        var result = _mapper.Map<FileResponse>(file);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(file.Id));
        Assert.That(result.Name, Is.EqualTo(file.Name));
        Assert.That(result.Type, Is.EqualTo(file.Type));
        Assert.That(result.ParentId, Is.EqualTo(file.ParentId));
        Assert.That(result.Description, Is.EqualTo(file.Description));
    }
}