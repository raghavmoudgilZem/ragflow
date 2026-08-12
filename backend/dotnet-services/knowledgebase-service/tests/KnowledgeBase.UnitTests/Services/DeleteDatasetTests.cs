using FluentAssertions;
using Moq;
using Xunit;

namespace KnowledgeBase.Application.UnitTests.Services;

public class DeleteDatasetTests : KnowledgeBaseServiceTestBase
{
    [Fact]
    public async Task DeleteDatasetAsync_ValidDataset_DeletesSuccessfully()
    {
        // Arrange
        var dataset = DatasetTestData.CreateKnowledgeBase();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                dataset.Id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dataset);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        await Service.DeleteDatasetAsync(
            dataset.Id, tenantid,
            CancellationToken.None);

        // Assert
        RepositoryMock.Verify(
            x => x.Remove(dataset),
            Times.Once);

        RepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
    [Fact]
    public async Task DeleteDatasetAsync_DatasetNotFound_ThrowsException()
    {
        // Arrange
        var datasetId = Guid.NewGuid();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                datasetId,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.KnowledgeBase?)null);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        Func<Task> action = async () =>
            await Service.DeleteDatasetAsync(
                datasetId, tenantid,
                CancellationToken.None);

        // Assert
        await action.Should()
            .ThrowAsync<KeyNotFoundException>();

        RepositoryMock.Verify(
            x => x.Remove(It.IsAny<Domain.Entities.KnowledgeBase>()),
            Times.Never);

        RepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
    [Fact]
    public async Task DeleteDatasetAsync_ShouldCallRepositoryDelete()
    {
        // Arrange
        var dataset = DatasetTestData.CreateKnowledgeBase();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                dataset.Id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dataset);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        await Service.DeleteDatasetAsync(dataset.Id, tenantid);

        // Assert
        RepositoryMock.Verify(
            x => x.Remove(
                It.Is<Domain.Entities.KnowledgeBase>(d => d.Id == dataset.Id)),
            Times.Once);
    }
    [Fact]
    public async Task DeleteDatasetAsync_ShouldCallSaveChanges()
    {
        // Arrange
        var dataset = DatasetTestData.CreateKnowledgeBase();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                dataset.Id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dataset);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        await Service.DeleteDatasetAsync(dataset.Id, tenantid);

        // Assert
        RepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}