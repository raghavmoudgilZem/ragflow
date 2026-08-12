using FluentAssertions;
using FluentValidation;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using Moq;
using Xunit;

namespace KnowledgeBase.Application.UnitTests.Services;

public class CreateDatasetTests : KnowledgeBaseServiceTestBase
{
    [Fact]
    public async Task CreateDatasetAsync_ValidRequest_ReturnsResponse()
    {
        // Arrange
        var request = CreateDatasetRequests.Valid();

        RepositoryMock
            .Setup(x => x.ExistsAsync(
                It.IsAny<Guid>(),
                request.Name,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        RepositoryMock
            .Setup(x => x.AddAsync(
                It.IsAny<Domain.Entities.KnowledgeBase>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        RepositoryMock
            .Setup(x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userid = Guid.Parse("11111111-1111-1111-1111-111111111111");
        // Act
        var result = await Service.CreateDatasetAsync(
            request, tenantid, userid,
            CancellationToken.None);

        // Assert
        result.Should().NotBeNull();

        result.Name.Should().Be(request.Name);

        result.Description.Should().Be(request.Description);

        RepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<Domain.Entities.KnowledgeBase>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        RepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
    [Fact]
    public async Task CreateDatasetAsync_DuplicateDataset_ThrowsException()
    {
        // Arrange
        var request = CreateDatasetRequests.Valid();

        RepositoryMock
            .Setup(x => x.ExistsAsync(
                It.IsAny<Guid>(),
                request.Name,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userid = Guid.Parse("11111111-1111-1111-1111-111111111111");
        // Act
        Func<Task> act = async () =>
            await Service.CreateDatasetAsync(
                request, tenantid, userid,
                CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<InvalidOperationException>();

        RepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<Domain.Entities.KnowledgeBase>(),
                It.IsAny<CancellationToken>()),
            Times.Never);

        RepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
    [Fact]
    public async Task CreateDatasetAsync_InvalidRequest_ThrowsValidationException()
    {
        // Arrange
        var request = CreateDatasetRequests.Valid();

        request.Name = "";
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userid = Guid.Parse("11111111-1111-1111-1111-111111111111");
        // Act
        Func<Task> act = async () =>
            await Service.CreateDatasetAsync(
                request, tenantid, userid,
                CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<ValidationException>();

        RepositoryMock.Verify(
            x => x.ExistsAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
}