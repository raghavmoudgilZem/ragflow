using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Ragflow.AdminService.API.Middlewares;
using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.Middlewares;

public class GatewayClaimsMiddlewareTests
{
    private readonly Mock<ILogger<GatewayClaimsMiddleware>> _logger = new();

    #region Authentication Tests

    [Fact]
    public async Task InvokeAsync_Should_Skip_Authentication_For_Auth_Endpoints()
    {
        // Arrange
        var nextCalled = false;

        RequestDelegate next = context =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new GatewayClaimsMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/auth/login";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(nextCalled);
    }

    [Fact]
    public async Task InvokeAsync_Should_Return_Unauthorized_When_UserId_Header_Is_Missing()
    {
        // Arrange
        var middleware = new GatewayClaimsMiddleware(context => Task.CompletedTask, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/users";

        using var responseStream = new MemoryStream();
        context.Response.Body = responseStream;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);

        responseStream.Position = 0;

        var json = await new StreamReader(responseStream).ReadToEndAsync();

        var response = JsonSerializer.Deserialize<ApiResponse<object>>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        Assert.NotNull(response);
        Assert.False(response.Success);
        Assert.Single(response.Errors);
        Assert.Equal("Missing user identity from API Gateway.", response.Errors.First());
    }

    [Fact]
    public async Task InvokeAsync_Should_Create_ClaimsPrincipal_When_Valid_Gateway_Headers_Are_Present()
    {
        // Arrange
        var nextCalled = false;

        RequestDelegate next = context =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new GatewayClaimsMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();

        context.Request.Path = "/api/v1/users";

        context.Request.Headers["X-User-Id"] = Guid.NewGuid().ToString();
        context.Request.Headers["X-User-Email"] = "admin@ragflow.com";
        context.Request.Headers["X-User-Roles"] = "Owner";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(nextCalled);

        Assert.Equal("admin@ragflow.com", context.User.FindFirst(ClaimTypes.Email)?.Value);

        Assert.Equal("Owner", context.User.FindFirst(ClaimTypes.Role)?.Value);

        Assert.NotNull(context.User.FindFirst(ClaimTypes.NameIdentifier));
    }

    [Fact]
    public async Task InvokeAsync_Should_Create_ClaimsPrincipal_When_Email_Header_Is_Missing()
    {
        // Arrange
        var middleware = new GatewayClaimsMiddleware(context => Task.CompletedTask, _logger.Object);

        var context = new DefaultHttpContext();

        context.Request.Path = "/api/v1/users";

        context.Request.Headers["X-User-Id"] = Guid.NewGuid().ToString();
        context.Request.Headers["X-User-Roles"] = "Owner";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(string.Empty, context.User.FindFirst(ClaimTypes.Email)?.Value);

        Assert.Equal("Owner", context.User.FindFirst(ClaimTypes.Role)?.Value);
    }

    [Fact]
    public async Task InvokeAsync_Should_Create_ClaimsPrincipal_When_Role_Header_Is_Missing()
    {
        // Arrange
        var middleware = new GatewayClaimsMiddleware(context => Task.CompletedTask, _logger.Object);

        var context = new DefaultHttpContext();

        context.Request.Path = "/api/v1/users";

        context.Request.Headers["X-User-Id"] = Guid.NewGuid().ToString();
        context.Request.Headers["X-User-Email"] = "admin@ragflow.com";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal("admin@ragflow.com", context.User.FindFirst(ClaimTypes.Email)?.Value);

        Assert.Equal(string.Empty, context.User.FindFirst(ClaimTypes.Role)?.Value);
    }

    [Fact]
    public async Task InvokeAsync_Should_Invoke_Next_Middleware_When_Claims_Are_Created()
    {
        // Arrange
        var nextCalled = false;

        RequestDelegate next = context =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new GatewayClaimsMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();

        context.Request.Path = "/api/v1/users";

        context.Request.Headers["X-User-Id"] = Guid.NewGuid().ToString();
        context.Request.Headers["X-User-Email"] = "admin@ragflow.com";
        context.Request.Headers["X-User-Roles"] = "Owner";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(nextCalled);
    }

    #endregion
}
