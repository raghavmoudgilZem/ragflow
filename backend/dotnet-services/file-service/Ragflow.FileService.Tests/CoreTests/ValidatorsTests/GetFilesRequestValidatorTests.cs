using FluentValidation.TestHelper;
using NUnit.Framework;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.Validators;

namespace Ragflow.FileService.Tests.Core.Validators;

[TestFixture]
public class GetFilesRequestValidatorTests
{
    private GetFilesRequestValidator _validator = null!;

    [SetUp]
    public void Setup()
    {
        _validator = new GetFilesRequestValidator();
    }

    [Test]
    public void Should_Have_Error_When_Page_Is_Zero()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 0,
            PageSize = 10
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Page);
    }

    [Test]
    public void Should_Have_Error_When_Page_Is_Negative()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = -1,
            PageSize = 10
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Page);
    }

    [Test]
    public void Should_Not_Have_Error_When_Page_Is_One()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 10
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Page);
    }

    [Test]
    public void Should_Have_Error_When_PageSize_Is_Zero()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 0
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PageSize);
    }

    [Test]
    public void Should_Have_Error_When_PageSize_Is_Greater_Than_100()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 101
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PageSize);
    }

    [Test]
    public void Should_Not_Have_Error_When_PageSize_Is_One()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 1
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.PageSize);
    }

    [Test]
    public void Should_Not_Have_Error_When_PageSize_Is_100()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 100
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.PageSize);
    }

    [TestCase(TestData.TestConstants.SortOrderAsc)]
    [TestCase(TestData.TestConstants.SortOrderDesc)]
    [TestCase(TestData.TestConstants.SortOrderAscLower)]
    [TestCase(TestData.TestConstants.SortOrderDescLower)]
    [TestCase(TestData.TestConstants.SortOrderAscTitle)]
    [TestCase(TestData.TestConstants.SortOrderDescTitle)]
    public void Should_Not_Have_Error_When_SortOrder_Is_Valid(string sortOrder)
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 10,
            SortOrder = sortOrder
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SortOrder);
    }

    [Test]
    public void Should_Not_Have_Error_When_SortOrder_Is_Null()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 10,
            SortOrder = null
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SortOrder);
    }

    [Test]
    public void Should_Not_Have_Error_When_SortOrder_Is_Empty()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 10,
            SortOrder = string.Empty
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SortOrder);
    }

    [Test]
    public void Should_Not_Have_Error_When_SortOrder_Is_Whitespace()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 10,
            SortOrder = "   "
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SortOrder);
    }

    [Test]
    public void Should_Have_Error_When_SortOrder_Is_Invalid()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 10,
            SortOrder = "INVALID"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SortOrder)
              .WithErrorMessage("SortOrder must be ASC or DESC.");
    }

    [Test]
    public void Should_Not_Have_Any_Validation_Errors_When_Request_Is_Valid()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            Page = 1,
            PageSize = 25,
            SortOrder = TestData.TestConstants.SortOrderAsc
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}