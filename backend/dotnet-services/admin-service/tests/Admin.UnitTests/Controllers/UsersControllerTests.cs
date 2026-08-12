using Admin.UnitTests.TestData;
using AdminService.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Ragflow.AdminService.API.Controllers;
using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<IUsersService> _usersService = new();
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _controller = new UsersController(_usersService.Object);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers.Authorization = TestConstants.Authorization;

        _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
    }

    #region GetUsers Tests

    [Fact]
    public async Task GetUsers_Should_Return_Ok_When_GetUsers_Succeeds()
    {
        // Arrange
        var request = GetUsersRequests.Valid();

        var pagedResponse = PagedUserResponses.Valid();

        var serviceResponse = ApiResponse<PagedUserResponseDto>.SuccessResponse(pagedResponse);
        _usersService
            .Setup(x => x.GetUsersAsync(request, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.GetUsers(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<PagedUserResponseDto>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Single(response.Data!.Items);

        // Verify pagination instead
        Assert.NotNull(response.Data.Pagination);
        _usersService.Verify(
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
    public async Task GetUsers_Should_Return_BadRequest_When_GetUsers_Fails()
    {
        // Arrange
        var request = new GetUsersRequestDto();

        var serviceResponse = ApiResponse<PagedUserResponseDto>.ErrorResponse(
            TestConstants.GetUsersFailed
        );

        _usersService
            .Setup(x => x.GetUsersAsync(request, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.GetUsers(request, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<PagedUserResponseDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _usersService.Verify(
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
    public async Task GetUsers_Should_Pass_Request_To_Service()
    {
        // Arrange
        var request = GetUsersRequests.Valid();

        var serviceResponse = ApiResponse<PagedUserResponseDto>.SuccessResponse(
            PagedUserResponses.Valid()
        );

        _usersService
            .Setup(x => x.GetUsersAsync(request, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        await _controller.GetUsers(request, CancellationToken.None);

        // Assert
        _usersService.Verify(
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

    #region GetUser Tests

    [Fact]
    public async Task GetUser_Should_Return_Ok_When_User_Exists()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = UserDetailsDtos.Valid(userId);

        var serviceResponse = ApiResponse<UserDetailsDto>.SuccessResponse(user);

        _usersService
            .Setup(x => x.GetUserAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.GetUser(userId, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserDetailsDto>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(userId, response.Data!.Id);
        Assert.Equal(user.Email, response.Data.Email);

        _usersService.Verify(
            x => x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task GetUser_Should_Return_BadRequest_When_GetUser_Fails()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var serviceResponse = ApiResponse<UserDetailsDto>.ErrorResponse(TestConstants.UserNotFound);

        _usersService
            .Setup(x => x.GetUserAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.GetUser(userId, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserDetailsDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _usersService.Verify(
            x => x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task GetUser_Should_Pass_UserId_And_Authorization_Header_To_Service()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var serviceResponse = ApiResponse<UserDetailsDto>.SuccessResponse(UserDetailsDtos.Valid());

        _usersService
            .Setup(x => x.GetUserAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        await _controller.GetUser(userId, CancellationToken.None);

        // Assert
        _usersService.Verify(
            x => x.GetUserAsync(userId, TestConstants.Authorization, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    #endregion

    #region GetUserTenants Tests

    [Fact]
    public async Task GetUserTenants_Should_Return_Ok_When_GetUserTenants_Succeeds()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var tenants = UserTenantDtos.Valid();

        var serviceResponse = ApiResponse<List<UserTenantDto>>.SuccessResponse(tenants);

        _usersService
            .Setup(x =>
                x.GetUserTenantsAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.GetUserTenants(userId, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<List<UserTenantDto>>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(2, response.Data!.Count);

        _usersService.Verify(
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
    public async Task GetUserTenants_Should_Return_BadRequest_When_GetUserTenants_Fails()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var serviceResponse = ApiResponse<List<UserTenantDto>>.ErrorResponse(
            TestConstants.UserNotFound
        );

        _usersService
            .Setup(x =>
                x.GetUserTenantsAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.GetUserTenants(userId, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<List<UserTenantDto>>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _usersService.Verify(
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
    public async Task GetUserTenants_Should_Pass_UserId_And_Authorization_Header_To_Service()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var serviceResponse = ApiResponse<List<UserTenantDto>>.SuccessResponse(
            UserTenantDtos.Valid()
        );

        _usersService
            .Setup(x =>
                x.GetUserTenantsAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(serviceResponse);

        // Act
        await _controller.GetUserTenants(userId, CancellationToken.None);

        // Assert
        _usersService.Verify(
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

    #region EnableUser Tests

    [Fact]
    public async Task EnableUser_Should_Return_Ok_When_Enable_Succeeds()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var dto = new UserEnableDisableDto { UserId = userId, Status = TestConstants.ActiveStatus };

        var serviceResponse = ApiResponse<UserEnableDisableDto>.SuccessResponse(dto);

        _usersService
            .Setup(x =>
                x.EnableUserAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.EnableUser(userId.ToString(), CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserEnableDisableDto>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(TestConstants.ActiveStatus, response.Data!.Status);

        _usersService.Verify(
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
    public async Task EnableUser_Should_Return_BadRequest_When_Enable_Fails()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var serviceResponse = ApiResponse<UserEnableDisableDto>.ErrorResponse(
            TestConstants.EnableUserFailed
        );

        _usersService
            .Setup(x =>
                x.EnableUserAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.EnableUser(userId.ToString(), CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserEnableDisableDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _usersService.Verify(
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
    public async Task EnableUser_Should_Return_BadRequest_When_UserId_Is_Invalid()
    {
        // Act
        var result = await _controller.EnableUser(
            TestConstants.InvalidGuid,
            CancellationToken.None
        );

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserEnableDisableDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.Contains(TestConstants.InvalidUserId, response.Errors);

        _usersService.Verify(
            x =>
                x.EnableUserAsync(
                    It.IsAny<Guid>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Never
        );
    }

    #endregion

    #region DisableUser Tests

    [Fact]
    public async Task DisableUser_Should_Return_Ok_When_Disable_Succeeds()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var dto = new UserEnableDisableDto
        {
            UserId = userId,
            Status = TestConstants.DisabledStatus,
        };

        var serviceResponse = ApiResponse<UserEnableDisableDto>.SuccessResponse(dto);

        _usersService
            .Setup(x =>
                x.DisableUserAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.DisableUser(userId.ToString(), CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserEnableDisableDto>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(TestConstants.DisabledStatus, response.Data!.Status);

        _usersService.Verify(
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
    public async Task DisableUser_Should_Return_BadRequest_When_Disable_Fails()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var serviceResponse = ApiResponse<UserEnableDisableDto>.ErrorResponse(
            TestConstants.DisableUserFailed
        );

        _usersService
            .Setup(x =>
                x.DisableUserAsync(userId, It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.DisableUser(userId.ToString(), CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserEnableDisableDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _usersService.Verify(
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
    public async Task DisableUser_Should_Return_BadRequest_When_UserId_Is_Invalid()
    {
        // Act
        var result = await _controller.DisableUser(
            TestConstants.InvalidGuid,
            CancellationToken.None
        );

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserEnableDisableDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.Contains(TestConstants.InvalidUserId, response.Errors);

        _usersService.Verify(
            x =>
                x.DisableUserAsync(
                    It.IsAny<Guid>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Never
        );
    }

    #endregion
}
