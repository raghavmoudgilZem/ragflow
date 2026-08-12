using FluentValidation.TestHelper;
using NUnit.Framework;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.Validators;

namespace Ragflow.FileService.Tests.Core.Validators;

[TestFixture]
public class UpdateFileRequestValidatorTests
{
    private UpdateFileRequestValidator _validator = null!;

    [SetUp]
    public void Setup()
    {
        _validator = new UpdateFileRequestValidator();
    }

    [Test]
    public void Should_Not_Have_Error_When_Description_Is_Null()
    {
        // Arrange
        var request = new UpdateFileRequest
        {
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
        var request = new UpdateFileRequest
        {
            Description = string.Empty
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Description);
    }

    [Test]
    public void Should_Not_Have_Error_When_Description_Is_Whitespace()
    {
        // Arrange
        var request = new UpdateFileRequest
        {
            Description = "   "
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Description);
    }

    [Test]
    public void Should_Have_Error_When_Description_Exceeds_Maximum_Length()
    {
        // Arrange
        var request = new UpdateFileRequest
        {
            Description = TestData.TestConstants.Description1001Characters
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Description);
    }

    [Test]
    public void Should_Not_Have_Error_When_Description_Is_1000_Characters()
    {
        // Arrange
        var request = new UpdateFileRequest
        {
            Description = TestData.TestConstants.Description1000Characters
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Description);
    }

    [Test]
    public void Should_Not_Have_Any_Validation_Errors_When_Request_Is_Valid()
    {
        // Arrange
        var request = new UpdateFileRequest
        {
            Description = TestData.TestConstants.UpdatedDescription
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}