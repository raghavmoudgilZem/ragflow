using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Ragflow.FileService.Core.Constants;
using Ragflow.FileService.Core.DTOs.Requests;
using Ragflow.FileService.Core.DTOs.Responses;
using Ragflow.FileService.Core.Exceptions;
using Ragflow.FileService.Core.Interfaces;
using Ragflow.FileService.Core.Interfaces.Common;
using Ragflow.FileService.Core.Interfaces.Persistence;
using Ragflow.FileService.Core.Services;
using FileEntity = Ragflow.FileService.Domain.Entities.File;
using FileServiceImplementation = Ragflow.FileService.Core.Services.FileService;

namespace Ragflow.FileService.Tests.Services;

[TestFixture]
public class FileServiceTests
{
    private Mock<IFileRepository> _fileRepository = null!;
    private Mock<IUnitOfWork> _unitOfWork = null!;
    private Mock<ICurrentUserService> _currentUserService = null!;
    private Mock<ILogger<FileServiceImplementation>> _logger = null!;
    private Mock<IMapper> _mapper = null!;

    private FileServiceImplementation _service = null!;

    [SetUp]
    public void Setup()
    {
        _fileRepository = new Mock<IFileRepository>();
        _unitOfWork = new Mock<IUnitOfWork>();
        _currentUserService = new Mock<ICurrentUserService>();
        _logger = new Mock<ILogger<FileServiceImplementation>>();
        _mapper = new Mock<IMapper>();

        _service = new FileServiceImplementation(
            _fileRepository.Object,
            _unitOfWork.Object,
            _currentUserService.Object,
            _logger.Object,
            _mapper.Object);
    }

    [Test]
    public async Task CreateAsync_Should_Create_File_Successfully()
    {
        // Arrange
        var request = new CreateFileRequest
        {
            Name = TestData.TestConstants.GetDocumentFileName,
            Description = TestData.TestConstants.ValidFileName,
            ParentId = Guid.NewGuid(),
            Type = Domain.Entities.FileType.File
        };

        var userId = Guid.NewGuid();

        var response = new FileResponse
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description
        };

        _currentUserService
            .Setup(x => x.GetUserId())
            .Returns(userId);

        _mapper
            .Setup(x => x.Map<FileResponse>(It.IsAny<FileEntity>()))
            .Returns(response);

        // Act
        var result = await _service.CreateAsync(
            request,
            CancellationToken.None);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Name, Is.EqualTo(request.Name));

        _fileRepository.Verify(
            x => x.AddAsync(
                It.IsAny<FileEntity>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _unitOfWork.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task CreateAsync_Should_Set_CreatedBy()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _currentUserService
            .Setup(x => x.GetUserId())
            .Returns(userId);

        FileEntity? createdEntity = null;

        _fileRepository
            .Setup(x => x.AddAsync(
                It.IsAny<FileEntity>(),
                It.IsAny<CancellationToken>()))
            .Callback<FileEntity, CancellationToken>((entity, _) =>
            {
                createdEntity = entity;
            })
            .Returns(Task.CompletedTask);

        _mapper
            .Setup(x => x.Map<FileResponse>(It.IsAny<FileEntity>()))
            .Returns(new FileResponse());

        // Act
        await _service.CreateAsync(
            new CreateFileRequest
            {
                Name = TestData.TestConstants.ValidDescription,
                Type = Domain.Entities.FileType.File
            },
            CancellationToken.None);

        // Assert
        Assert.That(createdEntity, Is.Not.Null);
        Assert.That(createdEntity!.CreatedBy, Is.EqualTo(userId));
        Assert.That(createdEntity.IsDeleted, Is.False);
        Assert.That(createdEntity.CurrentVersion, Is.EqualTo(1));
    }


    [Test]
    public async Task GetFilesAsync_Should_Return_File_List_Response()
    {
        // Arrange
        var request = new GetFilesRequest
        {
            ParentId = Guid.NewGuid(),
            Search = "doc",
            Page = 1,
            PageSize = 10
        };

        var files = new List<FileEntity>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = TestData.TestConstants.ValidFileName
            }
        };

        var mappedFiles = new List<FileResponse>
        {
            new() { Id = files[0].Id, Name = files[0].Name },
            new() { Id = files[1].Id, Name = files[1].Name }
        };

        _fileRepository
            .Setup(x => x.GetFilesAsync(
                request.ParentId,
                request.Search,
                request.Page,
                request.PageSize,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(files);

        _fileRepository
            .Setup(x => x.GetTotalCountAsync(
                request.ParentId,
                request.Search,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        _mapper
            .Setup(x => x.Map<List<FileResponse>>(files))
            .Returns(mappedFiles);

        // Act
        var result = await _service.GetFilesAsync(
            request,
            CancellationToken.None);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.TotalRecords, Is.EqualTo(2));
        Assert.That(result.Files.Count, Is.EqualTo(2));

        _fileRepository.Verify(x => x.GetFilesAsync(
                request.ParentId,
                request.Search,
                request.Page,
                request.PageSize,
                It.IsAny<CancellationToken>()),
            Times.Once);

        _fileRepository.Verify(x => x.GetTotalCountAsync(
                request.ParentId,
                request.Search,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }


    [Test]
    public async Task GetByIdAsync_Should_Return_File_When_File_Exists()
    {
        // Arrange
        var id = Guid.NewGuid();

        var entity = new FileEntity
        {
            Id = id,
            Name = TestData.TestConstants.ValidFileName,
            IsDeleted = false
        };

        var response = new FileResponse
        {
            Id = id,
            Name = TestData.TestConstants.ValidFileName
        };

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);

        _mapper
            .Setup(x => x.Map<FileResponse>(entity))
            .Returns(response);

        // Act
        var result = await _service.GetByIdAsync(
            id,
            CancellationToken.None);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Id, Is.EqualTo(id));

        _fileRepository.Verify(x => x.GetByIdAsync(
            id,
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public void GetByIdAsync_Should_Throw_BusinessException_When_File_Not_Found()
    {
        // Arrange
        var id = Guid.NewGuid();

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((FileEntity?)null);

        // Act & Assert
        var ex = Assert.ThrowsAsync<BusinessException>(async () =>
            await _service.GetByIdAsync(
                id,
                CancellationToken.None));

        Assert.That(ex!.Message, Is.EqualTo(ExceptionConstants.FileNotFound));
    }

    [Test]
    public void GetByIdAsync_Should_Throw_BusinessException_When_File_Is_Deleted()
    {
        // Arrange
        var id = Guid.NewGuid();

        var entity = new FileEntity
        {
            Id = id,
            Name = TestData.TestConstants.ValidFileName,
            IsDeleted = true
        };

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);

        // Act & Assert
        var ex = Assert.ThrowsAsync<BusinessException>(async () =>
            await _service.GetByIdAsync(
                id,
                CancellationToken.None));

        Assert.That(ex!.Message, Is.EqualTo(ExceptionConstants.FileNotFound));
    }

    [Test]
    public async Task UpdateAsync_Should_Update_File_Successfully()
    {
        // Arrange
        var id = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var entity = new FileEntity
        {
            Id = id,
            Name = TestData.TestConstants.ValidFileName,
            Description = TestData.TestConstants.ValidDescription,
            ParentId = Guid.NewGuid(),
            IsDeleted = false
        };

        var request = new UpdateFileRequest
        {
            Description = TestData.TestConstants.ValidDescription,
            ParentId = Guid.NewGuid()
        };

        var response = new FileResponse
        {
            Id = id,
            Description = request.Description
        };

        _currentUserService
            .Setup(x => x.GetUserId())
            .Returns(userId);

        _fileRepository
            .Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);

        _mapper
            .Setup(x => x.Map<FileResponse>(entity))
            .Returns(response);

        // Act
        var result = await _service.UpdateAsync(
            id,
            request,
            CancellationToken.None);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(entity.Description, Is.EqualTo(request.Description));
        Assert.That(entity.ParentId, Is.EqualTo(request.ParentId));
        Assert.That(entity.UpdatedBy, Is.EqualTo(userId));

        _fileRepository.Verify(
            x => x.Update(entity),
            Times.Once);

        _unitOfWork.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public void UpdateAsync_Should_Throw_When_File_Not_Found()
    {
        // Arrange
        var id = Guid.NewGuid();

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((FileEntity?)null);

        // Act & Assert
        Assert.ThrowsAsync<BusinessException>(async () =>
            await _service.UpdateAsync(
                id,
                new UpdateFileRequest(),
                CancellationToken.None));
    }

    [Test]
    public void UpdateAsync_Should_Throw_When_File_Is_Deleted()
    {
        // Arrange
        var id = Guid.NewGuid();

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FileEntity
            {
                Id = id,
                IsDeleted = true
            });

        // Act & Assert
        Assert.ThrowsAsync<BusinessException>(async () =>
            await _service.UpdateAsync(
                id,
                new UpdateFileRequest(),
                CancellationToken.None));
    }

    [Test]
    public async Task RenameAsync_Should_Rename_File_Successfully()
    {
        // Arrange
        var id = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var entity = new FileEntity
        {
            Id = id,
            Name = TestData.TestConstants.ValidFileName,
            IsDeleted = false
        };

        var request = new RenameFileRequest
        {
            Name = TestData.TestConstants.ValidFileName
        };

        _currentUserService
            .Setup(x => x.GetUserId())
            .Returns(userId);

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);

        // Act
        var result = await _service.RenameAsync(
            id,
            request,
            CancellationToken.None);

        // Assert
        Assert.That(result.Success, Is.True);
        Assert.That(result.Message, Is.EqualTo(TestData.TestConstants.FileRenamedSuccessfully));
        Assert.That(entity.Name, Is.EqualTo(request.Name));
        Assert.That(entity.UpdatedBy, Is.EqualTo(userId));

        _fileRepository.Verify(
            x => x.Update(entity),
            Times.Once);

        _unitOfWork.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public void RenameAsync_Should_Throw_When_File_Not_Found()
    {
        // Arrange
        var id = Guid.NewGuid();

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((FileEntity?)null);

        // Act & Assert
        Assert.ThrowsAsync<BusinessException>(async () =>
            await _service.RenameAsync(
                id,
                new RenameFileRequest { Name = TestData.TestConstants.ValidFileName },
                CancellationToken.None));
    }

    [Test]
    public void RenameAsync_Should_Throw_When_File_Is_Deleted()
    {
        // Arrange
        var id = Guid.NewGuid();

        _fileRepository
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FileEntity
            {
                Id = id,
                IsDeleted = true
            });

        // Act & Assert
        Assert.ThrowsAsync<BusinessException>(async () =>
            await _service.RenameAsync(
                id,
                new RenameFileRequest { Name = TestData.TestConstants.ValidFileName },
                CancellationToken.None));
    }

    [Test]
public async Task DeleteAsync_Should_Delete_File_Successfully()
{
    // Arrange
    var id = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var entity = new FileEntity
    {
        Id = id,
        IsDeleted = false
    };

    _currentUserService
        .Setup(x => x.GetUserId())
        .Returns(userId);

    _fileRepository
        .Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
        .ReturnsAsync(entity);

    // Act
    var result = await _service.DeleteAsync(
        id,
        CancellationToken.None);

    // Assert
    Assert.That(result.Success, Is.True);
    Assert.That(entity.IsDeleted, Is.True);
    Assert.That(entity.UpdatedBy, Is.EqualTo(userId));

    _fileRepository.Verify(x => x.Update(entity), Times.Once);

    _unitOfWork.Verify(
        x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
        Times.Once);
}
[Test]
public void DeleteAsync_Should_Throw_When_File_Not_Found()
{
    var id = Guid.NewGuid();

    _fileRepository
        .Setup(x => x.GetByIdAsync(
            id,
            It.IsAny<CancellationToken>()))
        .ReturnsAsync((FileEntity?)null);

    Assert.ThrowsAsync<BusinessException>(() =>
        _service.DeleteAsync(id, CancellationToken.None));
}
[Test]
public void DeleteAsync_Should_Throw_When_File_IsDeleted()
{
    var id = Guid.NewGuid();

    _fileRepository
        .Setup(x => x.GetByIdAsync(
            id,
            It.IsAny<CancellationToken>()))
        .ReturnsAsync(new FileEntity
        {
            Id = id,
            IsDeleted = true
        });

    Assert.ThrowsAsync<BusinessException>(() =>
        _service.DeleteAsync(id, CancellationToken.None));
}

}