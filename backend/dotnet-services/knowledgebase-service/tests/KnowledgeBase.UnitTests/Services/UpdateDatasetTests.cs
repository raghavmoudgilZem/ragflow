using FluentAssertions;
using FluentValidation;
using KnowledgeBase.Application.Common;
using KnowledgeBase.Application.DTOs.Dataset;
using KnowledgeBase.Application.UnitTests.TestData;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using Moq;
using Xunit;

namespace KnowledgeBase.Application.UnitTests.Services;

public class UpdateDatasetsTests : KnowledgeBaseServiceTestBase
{
    [Fact]
    public async Task UpdateDatasetAsync_ValidRequest_UpdatesDataset()
    {
        // Arrange
        var dataset = DatasetTestData.CreateKnowledgeBase();

        var request = UpdateDatasetRequests.Valid();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                dataset.Id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dataset);

        RepositoryMock
            .Setup(x => x.ExistsAsync(
                It.IsAny<Guid>(),
                request.Name,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userid = Guid.Parse("11111111-1111-1111-1111-111111111111");
        // Act
        var result = await Service.UpdateDatasetAsync(
            dataset.Id, tenantid, userid,
            request);

        // Assert
        result.Should().NotBeNull();

        result.Name.Should().Be(request.Name);

        RepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
    [Fact]
    public async Task UpdateDatasetAsync_DatasetNotFound_ThrowsException()
    {
        var request = UpdateDatasetRequests.Valid();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.KnowledgeBase?)null);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userid = Guid.Parse("11111111-1111-1111-1111-111111111111");
        Func<Task> action = async () =>
            await Service.UpdateDatasetAsync(
                Guid.NewGuid(), tenantid, userid,
                request);

        await action.Should()
            .ThrowAsync<KeyNotFoundException>();
    }
    [Fact]
    public async Task UpdateDatasetAsync_DuplicateName_ThrowsException()
    {
        var dataset = DatasetTestData.CreateKnowledgeBase();

        var request = UpdateDatasetRequests.Valid();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                dataset.Id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dataset);

        RepositoryMock
            .Setup(x => x.ExistsAsync(
                It.IsAny<Guid>(),
                request.Name,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userid = Guid.Parse("11111111-1111-1111-1111-111111111111");
        Func<Task> action = async () =>
            await Service.UpdateDatasetAsync(
                dataset.Id, tenantid, userid,
                request);

        await action.Should()
            .ThrowAsync<InvalidOperationException>();

        RepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Never);
    }


    [Fact]
    public async Task UpdateDatasetAsync_InvalidRequest_ThrowsValidationException()
    {
        var request = UpdateDatasetRequests.Invalid();
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userid = Guid.Parse("11111111-1111-1111-1111-111111111111");
        Func<Task> action = async () =>
            await Service.UpdateDatasetAsync(
                Guid.NewGuid(), tenantid, userid,
                request);

        await action.Should()
            .ThrowAsync<ValidationException>();
    }
}