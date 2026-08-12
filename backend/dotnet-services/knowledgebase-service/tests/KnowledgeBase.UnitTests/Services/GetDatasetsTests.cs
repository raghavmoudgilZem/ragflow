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

public class GetDatasetsTests : KnowledgeBaseServiceTestBase
{
    [Fact]
    public async Task GetDatasetsAsync_ValidRequest_ReturnsDatasets()
    {
        // Arrange
        var request = GetDatasetRequests.Valid();

        var datasets = new List<Domain.Entities.KnowledgeBase>
    {
        DatasetTestData.CreateKnowledgeBase(),
        DatasetTestData.CreateKnowledgeBase()
    };

        var pagedResult = new PagedResult<Domain.Entities.KnowledgeBase>
        {
            Items = datasets,
            TotalRecords = 2,

            PageNumber = 1,
            PageSize = 10
        };

        RepositoryMock
            .Setup(x => x.GetPagedAsync(
                It.IsAny<Guid>(),
                request,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        var result = await Service.GetDatasetsAsync(request, tenantid);

        // Assert
        result.Should().NotBeNull();

        result.Items.Should().HaveCount(2);

        result.TotalRecords.Should().Be(2);
    }
    [Fact]
    public async Task GetDatasetsAsync_ValidRequest_ReturnsEmptyResult()
    {
        // Arrange
        var request = GetDatasetRequests.Valid();

        var datasets = new List<Domain.Entities.KnowledgeBase>
        {

        };

        var pagedResult = new PagedResult<Domain.Entities.KnowledgeBase>
        {
            Items = datasets,
            TotalRecords = 0,

            PageNumber = 1,
            PageSize = 10
        };

        RepositoryMock
            .Setup(x => x.GetPagedAsync(
                It.IsAny<Guid>(),
                request,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        var result = await Service.GetDatasetsAsync(request, tenantid);

        // Assert
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetDatasetsAsync_InvalidRequest_ThrowsException()
    {
        // Arrange
        var request = GetDatasetRequests.InvalidPageNumber();

        var datasets = new List<Domain.Entities.KnowledgeBase>
    {
         DatasetTestData.CreateKnowledgeBase(),
        DatasetTestData.CreateKnowledgeBase()
    };

        var pagedResult = new PagedResult<Domain.Entities.KnowledgeBase>
        {
            Items = datasets,
            TotalRecords = 0,

            PageNumber = 1,
            PageSize = 10
        };

        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        Func<Task> act = async () =>
          await Service.GetDatasetsAsync(
              request, tenantid,
              CancellationToken.None);
        await act.Should()
            .ThrowAsync<ValidationException>();

        RepositoryMock.Verify(
        x => x.GetPagedAsync(
            It.IsAny<Guid>(),
            It.IsAny<GetDatasetsRequest>(),
            It.IsAny<CancellationToken>()),
        Times.Never);
        // Assert

    }
    [Fact]
    public async Task GetDatasetsAsync_ShouldCallRepositoryOnce()
    {
        // Arrange
        var request = GetDatasetRequests.Valid();

        RepositoryMock
            .Setup(x => x.GetPagedAsync(
                It.IsAny<Guid>(),
                request,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedResult<Domain.Entities.KnowledgeBase>());
        var tenantid = Guid.Parse("22222222-2222-2222-2222-222222222222");
        // Act
        await Service.GetDatasetsAsync(request, tenantid);

        // Assert
        RepositoryMock.Verify(
            x => x.GetPagedAsync(
                It.IsAny<Guid>(),
                request,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

}