using FluentValidation.TestHelper;
using NUnit.Framework;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.Validators;

namespace Ragflow.FileService.Tests.Core.Validators;

[TestFixture]
public class RenameFileRequestValidatorTests
{
    private RenameFileRequestValidator _validator = null!;

    [SetUp]
    public void Setup()
    {
        _validator = new RenameFileRequestValidator();
    }

    [Test]
    public void Should_Have_Error_When_Name_Is_Null()
    {
        // Arrange
        var request = new RenameFileRequest
        {
            Name = null!
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Test]
    public void Should_Have_Error_When_Name_Is_Empty()
    {
        // Arrange
        var request = new RenameFileRequest
        {
            Name = string.Empty
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
        var request = new RenameFileRequest
        {
            Name = TestData.TestConstants.Name256Characters
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
        var request = new RenameFileRequest
        {
            Name = TestData.TestConstants.RenameFileName
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Test]
    public void Should_Not_Have_Any_Validation_Errors_When_Request_Is_Valid()
    {
        // Arrange
        var request = new RenameFileRequest
        {
            Name = TestData.TestConstants.RenameFileName
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}