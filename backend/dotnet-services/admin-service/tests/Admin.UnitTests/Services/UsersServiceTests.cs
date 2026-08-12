using Admin.UnitTests.TestData;
using AdminService.Core.Interfaces;
using AdminService.Infrastructure.Services;
using Moq;
using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.Services;

public class UsersServiceTests
{
    private readonly Mock<IUsersApiClient> _usersApiClient = new();
    private readonly UsersService _usersService;

    public UsersServiceTests()
    {
        _usersService = new UsersService(_usersApiClient.Object);
    }

    #region GetUsersAsync Tests

    [Fact]
    public async Task GetUsersAsync_Should_Return_Success_Response_When_ApiClient_Returns_Data()
    {
        // Arrange
        var request = GetUsersRequests.Valid();

        var apiResponse = ApiResponses.UsersSuccess();

        _usersApiClient
            .Setup(x =>
                x.GetUsersAsync(request, TestConstants.Authorization, It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(apiResponse);

        // Act
        var result = await _usersService.GetUsersAsync(
            request,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);

        _usersApiClient.Verify(
            x =>
                x.GetUsersAsync(
                    request,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task GetUsersAsync_Should_Return_Error_Response_When_ApiClient_Returns_Null()
    {
        // Arrange
        var request = GetUsersRequests.Valid();

        _usersApiClient
            .Setup(x =>
                x.GetUsersAsync(request, TestConstants.Authorization, It.IsAny<CancellationToken>())
            )
            .ReturnsAsync((ApiResponse<PagedUserResponseDto>?)null);

        // Act
        var result = await _usersService.GetUsersAsync(
            request,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        Assert.False(result.Success);
        Assert.Contains(TestConstants.GetUsersFailed, result.Errors);

        _usersApiClient.Verify(
            x =>
                x.GetUsersAsync(
                    request,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task GetUsersAsync_Should_Call_ApiClient_Once_With_Correct_Request_And_Authorization()
    {
        // Arrange
        var request = GetUsersRequests.Valid();

        _usersApiClient
            .Setup(x =>
                x.GetUsersAsync(request, TestConstants.Authorization, It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(ApiResponses.UsersSuccess());

        // Act
        await _usersService.GetUsersAsync(
            request,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        _usersApiClient.Verify(
            x =>
                x.GetUsersAsync(
                    request,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    #endregion

    #region GetUserAsync Tests

    [Fact]
    public async Task GetUserAsync_Should_Return_Success_Response_When_ApiClient_Returns_Data()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(ApiResponses.UserDetailsSuccess());

        // Act
        var result = await _usersService.GetUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);

        _usersApiClient.Verify(
            x => x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task GetUserAsync_Should_Return_Error_Response_When_ApiClient_Returns_Null()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>())
            )
            .ReturnsAsync((ApiResponse<UserDetailsDto>?)null);

        // Act
        var result = await _usersService.GetUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );
        // Assert
        Assert.False(result.Success);
        Assert.Contains(TestConstants.GetUserFailed, result.Errors);
    }

    [Fact]
    public async Task GetUserAsync_Should_Call_ApiClient_Once_With_Correct_UserId_And_Authorization()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(ApiResponses.UserDetailsSuccess());

        await _usersService.GetUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        _usersApiClient.Verify(
            x => x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    #endregion

    #region GetUserTenantsAsync Tests

    [Fact]
    public async Task GetUserTenantsAsync_Should_Return_Success_Response_When_ApiClient_Returns_Data()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var apiResponse = ApiResponses.UserTenantsSuccess();

        _usersApiClient
            .Setup(x =>
                x.GetUserTenantsAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(apiResponse);
        // Act
        var result = await _usersService.GetUserTenantsAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(2, result.Data!.Count);
        Assert.Equal(TestConstants.TenantOneName, result.Data[0].TenantName);
        Assert.Equal(TestConstants.AdminRole, result.Data[0].Role);
    }

    [Fact]
    public async Task GetUserTenantsAsync_Should_Return_Error_Response_When_ApiClient_Returns_Null()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.GetUserTenantsAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync((ApiResponse<List<UserTenantDto>>?)null);

        // Act
        var result = await _usersService.GetUserTenantsAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        Assert.False(result.Success);
        Assert.Null(result.Data);
        Assert.Contains(TestConstants.GetUserTenantsFailed, result.Errors);

        _usersApiClient.Verify(
            x =>
                x.GetUserTenantsAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task GetUserTenantsAsync_Should_Call_ApiClient_Once_With_Correct_UserId_And_Authorization()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var apiResponse = ApiResponses.UserTenantsSuccess();

        _usersApiClient
            .Setup(x =>
                x.GetUserTenantsAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(apiResponse);

        // Act
        await _usersService.GetUserTenantsAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        _usersApiClient.Verify(
            x =>
                x.GetUserTenantsAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    #endregion

    #region EnableUserAsync Tests

    [Fact]
    public async Task EnableUserAsync_Should_Return_Success_Response_When_ApiClient_Returns_Data()
    {
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.EnableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(ApiResponse<UserEnableDisableDto>.SuccessResponse(new()));

        var result = await _usersService.EnableUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        Assert.True(result.Success);

        _usersApiClient.Verify(
            x =>
                x.EnableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task EnableUserAsync_Should_Return_Error_Response_When_ApiClient_Returns_Null()
    {
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.EnableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync((ApiResponse<UserEnableDisableDto>?)null);

        var result = await _usersService.EnableUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        Assert.False(result.Success);
        Assert.Contains(TestConstants.EnableUserFailed, result.Errors);
    }

    [Fact]
    public async Task EnableUserAsync_Should_Call_ApiClient_Once_With_Correct_UserId_And_Authorization()
    {
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.EnableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(ApiResponse<UserEnableDisableDto>.SuccessResponse(new()));

        await _usersService.EnableUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        _usersApiClient.Verify(
            x =>
                x.EnableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    #endregion

    #region DisableUserAsync Tests

    [Fact]
    public async Task DisableUserAsync_Should_Return_Success_Response_When_ApiClient_Returns_Data()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var disableUserResponse = new UserEnableDisableDto
        {
            UserId = userId,
            Status = TestConstants.DisabledStatus,
        };

        var apiResponse = ApiResponse<UserEnableDisableDto>.SuccessResponse(disableUserResponse);

        _usersApiClient
            .Setup(x =>
                x.DisableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(apiResponse);

        // Act
        var result = await _usersService.DisableUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(userId, result.Data!.UserId);
        Assert.Equal(TestConstants.DisabledStatus, result.Data.Status);

        _usersApiClient.Verify(
            x =>
                x.DisableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task DisableUserAsync_Should_Return_Error_Response_When_ApiClient_Returns_Null()
    {
        var userId = Guid.NewGuid();

        var disableUserResponse = new UserEnableDisableDto
        {
            UserId = userId,
            Status = TestConstants.DisabledStatus,
        };

        var apiResponse = ApiResponse<UserEnableDisableDto>.SuccessResponse(disableUserResponse);

        _usersApiClient
            .Setup(x =>
                x.DisableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync((ApiResponse<UserEnableDisableDto>?)null);

        // Act
        var result = await _usersService.DisableUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert

        // Assert
        Assert.False(result.Success);
        Assert.Contains(TestConstants.DisableUserFailed, result.Errors); // or TestConstants.DisableUserFailed if it matches
        Assert.Null(result.Data);

        _usersApiClient.Verify(
            x =>
                x.DisableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task DisableUserAsync_Should_Call_ApiClient_Once_With_Correct_UserId_And_Authorization()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _usersApiClient
            .Setup(x =>
                x.DisableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(
                ApiResponse<UserEnableDisableDto>.SuccessResponse(
                    new UserEnableDisableDto
                    {
                        UserId = userId,
                        Status = TestConstants.DisabledStatus,
                    }
                )
            );

        // Act
        await _usersService.DisableUserAsync(
            userId,
            TestConstants.Authorization,
            CancellationToken.None
        );

        // Assert
        _usersApiClient.Verify(
            x =>
                x.DisableUserAsync(
                    userId,
                    TestConstants.Authorization,
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    #endregion
}
