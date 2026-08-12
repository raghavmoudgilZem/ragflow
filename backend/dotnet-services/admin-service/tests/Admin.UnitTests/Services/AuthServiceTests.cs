using AdminService.Core.Interfaces;
using AdminService.Infrastructure.Services;
using Moq;
using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.Services;

public class AuthServiceTests
{
    private readonly Mock<IIdentityApiClient> _identityApi = new();

    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _authService = new AuthService(_identityApi.Object);
    }

    #region Login Tests

    [Fact]
    public async Task LoginAsync_Should_Return_Success_Response_When_IdentityApi_Returns_Success()
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

        var apiResponse = ApiResponse<LoginUserDto>.SuccessResponse(loginUser);

        _identityApi
            .Setup(x => x.LoginAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiResponse);

        // Act
        var result = await _authService.LoginAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(loginUser.Email, result.Data!.Email);

        _identityApi.Verify(x => x.LoginAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_Should_Return_Error_Response_When_IdentityApi_Returns_Null()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "admin@ragflow.com",
            Password = "Password@123",
        };

        _identityApi
            .Setup(x => x.LoginAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ApiResponse<LoginUserDto>?)null);

        // Act
        var result = await _authService.LoginAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Login failed.", result.Errors);

        _identityApi.Verify(x => x.LoginAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Refresh Tests

    [Fact]
    public async Task RefreshAsync_Should_Return_Success_Response_When_IdentityApi_Returns_Success()
    {
        // Arrange
        var request = new RefreshTokenRequestDto { RefreshToken = "refresh-token" };

        var refreshResponse = new RefreshTokenResponseDto
        {
            AccessToken = "new-access-token",
            RefreshToken = "new-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
        };

        var apiResponse = ApiResponse<RefreshTokenResponseDto>.SuccessResponse(refreshResponse);

        _identityApi
            .Setup(x => x.RefreshAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiResponse);

        // Act
        var result = await _authService.RefreshAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(refreshResponse.AccessToken, result.Data!.AccessToken);

        _identityApi.Verify(
            x => x.RefreshAsync(request, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task RefreshAsync_Should_Return_Error_Response_When_IdentityApi_Returns_Null()
    {
        // Arrange
        var request = new RefreshTokenRequestDto { RefreshToken = "refresh-token" };

        _identityApi
            .Setup(x => x.RefreshAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ApiResponse<RefreshTokenResponseDto>?)null);

        // Act
        var result = await _authService.RefreshAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Refresh failed.", result.Errors);

        _identityApi.Verify(
            x => x.RefreshAsync(request, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    #endregion

    #region Logout Tests

    [Fact]
    public async Task LogoutAsync_Should_Return_Success_Response_When_IdentityApi_Returns_Success()
    {
        // Arrange
        var request = new LogoutRequestDto { RefreshToken = "refresh-token" };

        var logoutResponse = new LogoutResponseDto { Message = "Logout successful." };

        var apiResponse = ApiResponse<LogoutResponseDto>.SuccessResponse(logoutResponse);

        _identityApi
            .Setup(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiResponse);

        // Act
        var result = await _authService.LogoutAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(logoutResponse.Message, result.Data!.Message);

        _identityApi.Verify(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LogoutAsync_Should_Return_Error_Response_When_IdentityApi_Returns_Null()
    {
        // Arrange
        var request = new LogoutRequestDto { RefreshToken = "refresh-token" };

        _identityApi
            .Setup(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ApiResponse<LogoutResponseDto>?)null);

        // Act
        var result = await _authService.LogoutAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Logout failed.", result.Errors);

        _identityApi.Verify(x => x.LogoutAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion
}
