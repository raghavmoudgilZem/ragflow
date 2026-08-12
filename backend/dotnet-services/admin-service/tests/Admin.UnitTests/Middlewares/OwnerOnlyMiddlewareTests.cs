using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Ragflow.AdminService.API.Middlewares;
using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.Middlewares;

public class OwnerOnlyMiddlewareTests
{
    private readonly Mock<ILogger<OwnerOnlyMiddleware>> _logger = new();

    #region Authorization Tests

    [Fact]
    public async Task InvokeAsync_Should_Skip_Authorization_For_Auth_Endpoints()
    {
        // Arrange
        var nextCalled = false;

        RequestDelegate next = context =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new OwnerOnlyMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/auth/login";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(nextCalled);
    }

    [Fact]
    public async Task InvokeAsync_Should_Allow_Request_When_User_Role_Is_Owner()
    {
        // Arrange
        var nextCalled = false;

        RequestDelegate next = context =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new OwnerOnlyMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/users";

        context.User = CreatePrincipal("Owner");

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(nextCalled);
        Assert.NotEqual(StatusCodes.Status403Forbidden, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_Should_Allow_Request_When_User_Role_Is_Owner_Ignoring_Case()
    {
        // Arrange
        var nextCalled = false;

        RequestDelegate next = context =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new OwnerOnlyMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/users";

        context.User = CreatePrincipal("owner");

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(nextCalled);
    }

    [Fact]
    public async Task InvokeAsync_Should_Return_Forbidden_When_User_Role_Is_Admin()
    {
        // Arrange
        var middleware = new OwnerOnlyMiddleware(context => Task.CompletedTask, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/users";

        context.User = CreatePrincipal("Admin");

        using var responseStream = new MemoryStream();
        context.Response.Body = responseStream;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);

        responseStream.Position = 0;

        var json = await new StreamReader(responseStream).ReadToEndAsync();

        var response = JsonSerializer.Deserialize<ApiResponse<object>>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        Assert.NotNull(response);
        Assert.False(response.Success);
        Assert.Single(response.Errors);
        Assert.Equal("Only Super Admin can access this resource.", response.Errors.First());
    }

    [Fact]
    public async Task InvokeAsync_Should_Return_Forbidden_When_User_Role_Is_Missing()
    {
        // Arrange
        var middleware = new OwnerOnlyMiddleware(context => Task.CompletedTask, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/users";

        context.User = CreatePrincipal(string.Empty);

        using var responseStream = new MemoryStream();
        context.Response.Body = responseStream;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);

        responseStream.Position = 0;

        var json = await new StreamReader(responseStream).ReadToEndAsync();

        var response = JsonSerializer.Deserialize<ApiResponse<object>>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        Assert.NotNull(response);
        Assert.False(response.Success);
        Assert.Single(response.Errors);
        Assert.Equal("Only Super Admin can access this resource.", response.Errors.First());
    }

    [Fact]
    public async Task InvokeAsync_Should_Return_Forbidden_When_User_Is_Unauthorized()
    {
        // Arrange
        var middleware = new OwnerOnlyMiddleware(context => Task.CompletedTask, _logger.Object);

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/users";

        context.User = new ClaimsPrincipal(new ClaimsIdentity());

        using var responseStream = new MemoryStream();
        context.Response.Body = responseStream;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);

        responseStream.Position = 0;

        var json = await new StreamReader(responseStream).ReadToEndAsync();

        var response = JsonSerializer.Deserialize<ApiResponse<object>>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        Assert.NotNull(response);
        Assert.False(response.Success);
        Assert.Single(response.Errors);
        Assert.Equal("Only Super Admin can access this resource.", response.Errors.First());
    }

    #endregion

    private static ClaimsPrincipal CreatePrincipal(string role)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new(ClaimTypes.Email, "admin@ragflow.com"),
            new(ClaimTypes.Role, role),
        };

        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthentication"));
    }
}
