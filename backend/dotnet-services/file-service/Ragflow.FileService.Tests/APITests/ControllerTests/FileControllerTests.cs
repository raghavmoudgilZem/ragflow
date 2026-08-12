using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Ragflow.FileService.API.Controllers;
using Ragflow.FileService.Core.DTOs.Common;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.DTOs.Responses;
using Ragflow.FileService.Core.Interfaces;

namespace Ragflow.FileService.Tests.Controllers;

[TestFixture]
public class FilesControllerTests
{
    private Mock<IFileService> _fileService = null!;
    private Mock<ILogger<FilesController>> _logger = null!;
    private FilesController _controller = null!;

    [SetUp]
    public void Setup()
    {
        _fileService = new Mock<IFileService>();
        _logger = new Mock<ILogger<FilesController>>();

        _controller = new FilesController(
            _fileService.Object,
            _logger.Object);
    }

    [Test]
    public async Task Create_Should_Return_CreatedAtAction()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.ValidFileName
        };

        var response = new FileResponse
        {
            Id = Guid.NewGuid(),
            Name = request.Name
        };

        _fileService
            .Setup(x => x.CreateAsync(
                request,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _controller.Create(
            request,
            CancellationToken.None);

        // Assert
        var created = result as CreatedAtActionResult;

        Assert.That(created, Is.Not.Null);
        Assert.That(created!.ActionName, Is.EqualTo(nameof(FilesController.GetById)));

        var apiResponse = created.Value as ApiResponse<FileResponse>;

        Assert.That(apiResponse, Is.Not.Null);
        Assert.That(apiResponse!.Success, Is.True);
        Assert.That(apiResponse.Data!.Id, Is.EqualTo(response.Id));

        _fileService.Verify(x =>
            x.CreateAsync(
                request,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task GetFiles_Should_Return_Ok()
    {
        // Arrange
        var request = new GetFilesRequest();

        var response = new FileListResponse
        {
            Files = new List<FileResponse>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Name = TestData.TestConstants.GetFilesFileName
                }
            },
            TotalRecords = 1
        };

        _fileService
            .Setup(x => x.GetFilesAsync(
                request,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _controller.GetFiles(
            request,
            CancellationToken.None);

        // Assert
        var ok = result as OkObjectResult;

        Assert.That(ok, Is.Not.Null);

        var apiResponse = ok!.Value as ApiResponse<FileListResponse>;

        Assert.That(apiResponse, Is.Not.Null);
        Assert.That(apiResponse!.Success, Is.True);
        Assert.That(apiResponse.Data!.TotalRecords, Is.EqualTo(1));

        _fileService.Verify(x =>
            x.GetFilesAsync(
                request,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task GetById_Should_Return_Ok()
    {
        // Arrange
        var id = Guid.NewGuid();

        var response = new FileResponse
        {
            Id = id,
            Name = TestData.TestConstants.GetDocumentFileName
        };

        _fileService
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _controller.GetById(
            id,
            CancellationToken.None);

        // Assert
        var ok = result as OkObjectResult;

        Assert.That(ok, Is.Not.Null);

        var apiResponse = ok!.Value as ApiResponse<FileResponse>;

        Assert.That(apiResponse!.Success, Is.True);
        Assert.That(apiResponse.Data!.Id, Is.EqualTo(id));

        _fileService.Verify(x =>
            x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task Update_Should_Return_Ok()
    {
        // Arrange
        var id = Guid.NewGuid();

        var request = new UpdateFileRequest
        {
            Description = TestData.TestConstants.UpdatedDescription
        };

        var response = new FileResponse
        {
            Id = id,
            Description = request.Description
        };

        _fileService
            .Setup(x => x.UpdateAsync(
                id,
                request,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _controller.Update(
            id,
            request,
            CancellationToken.None);

        // Assert
        var ok = result as OkObjectResult;

        Assert.That(ok, Is.Not.Null);

        var apiResponse = ok!.Value as ApiResponse<FileResponse>;

        Assert.That(apiResponse!.Success, Is.True);
        Assert.That(apiResponse.Data!.Description, Is.EqualTo(TestData.TestConstants.UpdatedDescription));

        _fileService.Verify(x =>
            x.UpdateAsync(
                id,
                request,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task Rename_Should_Return_Ok()
    {
        // Arrange
        var id = Guid.NewGuid();

        var request = new RenameFileRequest
        {
            Name = TestData.TestConstants.RenameFileName
        };

        var response = new MessageResponse
        {
            Success = true,
            Message = "File renamed successfully"
        };

        _fileService
            .Setup(x => x.RenameAsync(
                id,
                request,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _controller.Rename(
            id,
            request,
            CancellationToken.None);

        // Assert
        var ok = result as OkObjectResult;

        Assert.That(ok, Is.Not.Null);

        var apiResponse = ok!.Value as ApiResponse<MessageResponse>;

        Assert.That(apiResponse!.Success, Is.True);
        Assert.That(apiResponse.Data!.Message,
            Is.EqualTo("File renamed successfully"));

        _fileService.Verify(x =>
            x.RenameAsync(
                id,
                request,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task Delete_Should_Return_Ok()
    {
        // Arrange
        var id = Guid.NewGuid();

        var response = new MessageResponse
        {
            Success = true,
            Message = TestData.TestConstants.FileDeletedMessage
        };

        _fileService
            .Setup(x => x.DeleteAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _controller.Delete(
            id,
            CancellationToken.None);

        // Assert
        var ok = result as OkObjectResult;

        Assert.That(ok, Is.Not.Null);

        var apiResponse = ok!.Value as ApiResponse<MessageResponse>;

        Assert.That(apiResponse!.Success, Is.True);
        Assert.That(apiResponse.Data!.Message,
            Is.EqualTo("File deleted successfully"));

        _fileService.Verify(x =>
            x.DeleteAsync(
                id,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [TestFixture]
    public class ApiResponseTests
    {
        [Test]
        public void SuccessResponse_Should_Create_Success_Response()
        {
            var data = TestData.TestConstants.ValidDescription;

            var result = ApiResponse<string>.SuccessResponse(data);

            Assert.That(result.Success, Is.True);
            Assert.That(result.Data, Is.EqualTo(data));
            Assert.That(result.Message, Is.Not.Empty);
            Assert.That(result.Timestamp, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public void Constructor_Should_Set_Default_Values()
        {
            var result = new ApiResponse<string>();

            Assert.That(result.Success, Is.False);
            Assert.That(result.Message, Is.EqualTo(string.Empty));
            Assert.That(result.Data, Is.Null);
            Assert.That(result.Timestamp, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public void ErrorResponse_Should_Return_Error_Response()
        {
            // Arrange
            const string message = TestData.TestConstants.InvalidRequestMessage;

            // Act
            var response = ApiResponse<string>.ErrorResponse(message);

            // Assert
            Assert.That(response.Success, Is.False);
            Assert.That(response.Message, Is.EqualTo(message));
            Assert.That(response.Data, Is.Null);
            Assert.That(response.Timestamp, Is.Not.EqualTo(default(DateTime)));
        }

    }
}