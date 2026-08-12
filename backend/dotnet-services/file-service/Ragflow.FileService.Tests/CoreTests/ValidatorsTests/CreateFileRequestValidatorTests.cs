using FluentValidation.TestHelper;
using NUnit.Framework;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.Validators;
using Ragflow.FileService.Domain.Entities;

namespace Ragflow.FileService.Tests.Core.Validators;

[TestFixture]
public class CreateFileRequestValidatorTests
{
    private CreateFileRequestValidator _validator = null!;

    [SetUp]
    public void Setup()
    {
        _validator = new CreateFileRequestValidator();
    }

    [Test]
    public void Should_Have_Error_When_Name_Is_Empty()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = string.Empty,
            Type = FileType.File
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Test]
    public void Should_Have_Error_When_Name_Is_Null()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = null!,
            Type = FileType.File
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Test]
    public void Should_Have_Error_When_Name_Exceeds_Maximum_Length()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.Name256Characters,
            Type = FileType.File
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Test]
    public void Should_Not_Have_Error_When_Name_Is_255_Characters()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.Name255Characters,
            Type = FileType.File
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Test]
    public void Should_Have_Error_When_Type_Is_Invalid()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = (FileType)999
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Type);
    }

    [Test]
    public void Should_Not_Have_Error_When_Type_Is_Valid()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Type);
    }

    [Test]
    public void Should_Have_Error_When_Description_Exceeds_Maximum_Length()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name =  TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            Description = TestData.TestConstants.Description1001Characters
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Description);
    }

    [Test]
    public void Should_Not_Have_Error_When_Description_Is_Null()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            Description = null
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Description);
    }

    [Test]
    public void Should_Not_Have_Error_When_Description_Is_Empty()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            Description = string.Empty
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Description);
    }

    [Test]
    public void Should_Have_Error_When_ParentId_Is_Empty_Guid()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            ParentId = Guid.Empty
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ParentId);
    }

    [Test]
    public void Should_Not_Have_Error_When_ParentId_Is_Null()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            ParentId = null
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.ParentId);
    }

    [Test]
    public void Should_Not_Have_Error_When_ParentId_Is_Valid()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            ParentId = Guid.NewGuid()
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.ParentId);
    }

    [Test]
    public void Should_Not_Have_Any_Validation_Errors_When_Request_Is_Valid()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName,
            Type = FileType.File,
            Description = TestData.TestConstants.ValidDescription,
            ParentId = Guid.NewGuid()
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}