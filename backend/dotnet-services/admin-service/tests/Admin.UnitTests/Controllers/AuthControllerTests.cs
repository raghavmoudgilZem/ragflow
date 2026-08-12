using AdminService.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Ragflow.AdminService.API.Controllers;
using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authService = new();
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _controller = new AuthController(_authService.Object);
    }

    #region Login Tests

    [Fact]
    public async Task Login_Should_Return_Ok_When_Login_Succeeds()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "admin@ragflow.com",
            Password = "Password@123",
        };

        var loginUser = new LoginUserDto
        {
            Id = Guid.NewGuid(),
            Email = "admin@ragflow.com",
            Name = "Super Admin",
            Roles = ["Owner"],
            AccessToken = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresIn = 3600,
        };

        var serviceResponse = ApiResponse<LoginUserDto>.SuccessResponse(loginUser);

        _authService
            .Setup(x => x.LoginAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<LoginUserDto>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(loginUser.Email, response.Data!.Email);

        _authService.Verify(x => x.LoginAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Login_Should_Return_BadRequest_When_Login_Fails()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "admin@ragflow.com",
            Password = "WrongPassword",
        };

        var serviceResponse = ApiResponse<LoginUserDto>.ErrorResponse("Invalid credentials.");

        _authService
            .Setup(x => x.LoginAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<LoginUserDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _authService.Verify(x => x.LoginAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Refresh Tests

    [Fact]
    public async Task Refresh_Should_Return_Ok_When_Refresh_Succeeds()
    {
        // Arrange
        var request = new RefreshTokenRequestDto { RefreshToken = "refresh-token" };

        var refreshResponse = new RefreshTokenResponseDto
        {
            AccessToken = "new-access-token",
            RefreshToken = "new-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
        };

        var serviceResponse = ApiResponse<RefreshTokenResponseDto>.SuccessResponse(refreshResponse);

        _authService
            .Setup(x => x.RefreshAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.Refresh(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<RefreshTokenResponseDto>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(refreshResponse.AccessToken, response.Data!.AccessToken);

        _authService.Verify(
            x => x.RefreshAsync(request, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task Refresh_Should_Return_BadRequest_When_Refresh_Fails()
    {
        // Arrange
        var request = new RefreshTokenRequestDto { RefreshToken = "invalid-refresh-token" };

        var serviceResponse = ApiResponse<RefreshTokenResponseDto>.ErrorResponse(
            "Invalid refresh token."
        );

        _authService
            .Setup(x => x.RefreshAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.Refresh(request, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<RefreshTokenResponseDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _authService.Verify(
            x => x.RefreshAsync(request, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    #endregion

    #region Logout Tests

    [Fact]
    public async Task Logout_Should_Return_Ok_When_Logout_Succeeds()
    {
        // Arrange
        var request = new LogoutRequestDto { RefreshToken = "refresh-token" };

        var logoutResponse = new LogoutResponseDto { Message = "Logout successful." };

        var serviceResponse = ApiResponse<LogoutResponseDto>.SuccessResponse(logoutResponse);

        _authService
            .Setup(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.Logout(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<LogoutResponseDto>>(okResult.Value);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(logoutResponse.Message, response.Data!.Message);

        _authService.Verify(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Logout_Should_Return_BadRequest_When_Logout_Fails()
    {
        // Arrange
        var request = new LogoutRequestDto { RefreshToken = "invalid-refresh-token" };

        var serviceResponse = ApiResponse<LogoutResponseDto>.ErrorResponse("Logout failed.");

        _authService
            .Setup(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(serviceResponse);

        // Act
        var result = await _controller.Logout(request, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse<LogoutResponseDto>>(badRequest.Value);

        Assert.False(response.Success);
        Assert.NotEmpty(response.Errors);

        _authService.Verify(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion
}
