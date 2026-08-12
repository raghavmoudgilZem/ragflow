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

public class GetDatasetByIdTests : KnowledgeBaseServiceTestBase
{
    [Fact]
    public async Task GetDatasetByIdAsync_DatasetExists_ReturnsDataset()
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
        var result = await Service.GetDatasetByIdAsync(dataset.Id, tenantid);

        // Assert
        result.Should().NotBeNull();

        result.Id.Should().Be(dataset.Id);

        result.Name.Should().Be(dataset.Name);
    }

    [Fact]
    public async Task GetDatasetByIdAsync_DatasetNotFound_ThrowsException()
    {
        // Arrange
        var id = Guid.NewGuid();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.KnowledgeBase?)null);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        Func<Task> action = async () =>
            await Service.GetDatasetByIdAsync(id, tenantid);

        // Assert
        await action.Should()
            .ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetDatasetByIdAsync_ShouldCallRepositoryOnce()
    {
        var dataset = DatasetTestData.CreateKnowledgeBase();

        RepositoryMock
            .Setup(x => x.GetByIdAsync(
                dataset.Id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dataset);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        await Service.GetDatasetByIdAsync(dataset.Id, tenantid);

        RepositoryMock.Verify(
            x => x.GetByIdAsync(
                dataset.Id,
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }















}