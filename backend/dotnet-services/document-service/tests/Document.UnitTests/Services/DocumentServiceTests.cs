using Document.Application.DTOs.Common;
using Document.Application.DTOs.External;
using Document.Application.Exceptions;
using Document.Application.Interfaces.Clients;
using Document.Application.Interfaces.Persistence;
using Document.Application.Interfaces.Repositories;
using Document.Application.Services;
using Document.Application.Tests.TestData;
using Document.Domain.Entities;
using Microsoft.Extensions.Logging;
using Moq;

namespace Document.Application.Tests.Services;

public class DocumentServiceTests
{
    private readonly Mock<IDocumentRepository> _documentRepository = new();

    private readonly Mock<IFileDocumentRepository> _fileDocumentRepository = new();

    private readonly Mock<IDocumentTaskRepository> _documentTaskRepository = new();

    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private readonly Mock<IDatasetServiceClient> _datasetServiceClient = new();

    private readonly Mock<IFileServiceClient> _fileServiceClient = new();

    private readonly Mock<IParsingServiceClient> _parsingServiceClient = new();

    private readonly Mock<ILogger<DocumentService>> _logger = new();

    private readonly DocumentService _service;

    public DocumentServiceTests()
    {
        _service = new DocumentService(
            _documentRepository.Object,
            _fileDocumentRepository.Object,
            _documentTaskRepository.Object,
            _unitOfWork.Object,
            _datasetServiceClient.Object,
            _fileServiceClient.Object,
            _parsingServiceClient.Object,
            _logger.Object);
    }
    [Fact]
    public async Task CreateDocumentAsync_Should_Create_Document()
    {
        var request = CreateDocumentRequests.Valid();

        var tenantId = Guid.NewGuid();

        var userId = Guid.NewGuid();

        _datasetServiceClient
            .Setup(x => x.GetKnowledgeBaseAsync(
                It.IsAny<Guid>(),
                tenantId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(KnowledgeBases.Valid());

        _documentRepository
            .Setup(x => x.GetByNameAsync(
                It.IsAny<Guid>(),
                tenantId,
                request.Name,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Document?)null);

        _fileServiceClient
            .Setup(x => x.UploadFileAsync(
                request.File,
                tenantId,
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(UploadFileResponses.Valid());

        var result = await _service.CreateDocumentAsync(
            request,
            tenantId,
            userId);

        Assert.NotNull(result);

        _documentRepository.Verify(
            x => x.AddAsync(
                It.IsAny<Domain.Entities.Document>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _fileDocumentRepository.Verify(
            x => x.AddAsync(
                It.IsAny<File2Document>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _unitOfWork.Verify(
            x => x.CommitAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);

        _parsingServiceClient.Verify(
            x => x.StartParsingAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                tenantId,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
    [Fact]
    public async Task CreateDocumentAsync_Should_Throw_When_Dataset_Not_Found()
    {
        var request = CreateDocumentRequests.Valid();

        _datasetServiceClient
            .Setup(x => x.GetKnowledgeBaseAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((KnowledgeBaseDto?)null);

        await Assert.ThrowsAsync<DatasetNotFoundException>(
            () => _service.CreateDocumentAsync(
                request,
                Guid.NewGuid(),
                Guid.NewGuid()));
    }
    [Fact]
    public async Task CreateDocumentAsync_Should_Throw_When_Document_Already_Exists()
    {
        var request = CreateDocumentRequests.Valid();

        _datasetServiceClient
            .Setup(x => x.GetKnowledgeBaseAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(KnowledgeBases.Valid());

        _documentRepository
            .Setup(x => x.GetByNameAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                request.Name,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Domain.Entities.Document());

        await Assert.ThrowsAsync<DuplicateDocumentException>(
            () => _service.CreateDocumentAsync(
                request,
                Guid.NewGuid(),
                Guid.NewGuid()));
    }
    [Fact]
    public async Task CreateDocumentAsync_Should_Throw_When_FileUpload_Fails()
    {
        var request = CreateDocumentRequests.Valid();

        _datasetServiceClient
            .Setup(x => x.GetKnowledgeBaseAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(KnowledgeBases.Valid());

        _documentRepository
            .Setup(x => x.GetByNameAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                request.Name,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Document?)null);

        _fileServiceClient
            .Setup(x => x.UploadFileAsync(
                It.IsAny<FileUploadRequest>(),
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new HttpRequestException());

        await Assert.ThrowsAsync<HttpRequestException>(
            () => _service.CreateDocumentAsync(
                request,
                Guid.NewGuid(),
                Guid.NewGuid()));
    }
    [Fact]
    public async Task CreateDocumentAsync_Should_Not_Start_Parsing_When_ParseImmediately_Is_False()
    {
        var request = CreateDocumentRequests.Valid();

        request.ParseImmediately = false;

        // Arrange other mocks same as happy path

        await _service.CreateDocumentAsync(
            request,
            Guid.NewGuid(),
            Guid.NewGuid());

        _parsingServiceClient.Verify(
            x => x.StartParsingAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
    [Fact]
    public async Task CreateDocumentAsync_Should_Delete_File_When_Commit_Fails()
    {
        var uploadedFile = UploadFileResponses.Valid();

        _fileServiceClient
            .Setup(x => x.UploadFileAsync(
                It.IsAny<FileUploadRequest>(),
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(uploadedFile);

        _unitOfWork
            .Setup(x => x.CommitAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception());

        await Assert.ThrowsAsync<Exception>(
            () => _service.CreateDocumentAsync(
                CreateDocumentRequests.Valid(),
                Guid.NewGuid(),
                Guid.NewGuid()));

        _fileServiceClient.Verify(
            x => x.DeleteFileAsync(
                uploadedFile.FileId,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}