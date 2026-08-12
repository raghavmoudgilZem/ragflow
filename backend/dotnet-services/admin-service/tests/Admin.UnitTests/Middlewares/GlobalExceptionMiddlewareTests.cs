using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Ragflow.AdminService.API.Middlewares;
using Ragflow.AdminService.Domain.DTOs;

namespace Admin.UnitTests.Middlewares;

public class GlobalExceptionMiddlewareTests
{
    private readonly Mock<ILogger<GlobalExceptionMiddleware>> _logger = new();

    #region Exception Handling Tests

    [Fact]
    public async Task InvokeAsync_Should_Invoke_Next_When_No_Exception_Is_Thrown()
    {
        // Arrange
        var nextCalled = false;

        RequestDelegate next = context =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new GlobalExceptionMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(nextCalled);
    }

    [Fact]
    public async Task InvokeAsync_Should_Return_HttpStatusCode_When_HttpRequestException_Is_Thrown()
    {
        // Arrange
        RequestDelegate next = context =>
        {
            throw new HttpRequestException("Unauthorized", null, HttpStatusCode.Unauthorized);
        };

        var middleware = new GlobalExceptionMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();

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
        Assert.Equal("Unauthorized", response.Errors.First());
    }

    [Fact]
    public async Task InvokeAsync_Should_Return_InternalServerError_When_Unhandled_Exception_Is_Thrown()
    {
        // Arrange
        RequestDelegate next = context =>
        {
            throw new Exception("Unexpected exception");
        };

        var middleware = new GlobalExceptionMiddleware(next, _logger.Object);

        var context = new DefaultHttpContext();

        using var responseStream = new MemoryStream();
        context.Response.Body = responseStream;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);

        responseStream.Position = 0;

        var json = await new StreamReader(responseStream).ReadToEndAsync();

        var response = JsonSerializer.Deserialize<ApiResponse<object>>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        Assert.NotNull(response);
        Assert.False(response.Success);
        Assert.Single(response.Errors);
        Assert.Equal(
            "An unexpected error occurred. Please try again later.",
            response.Errors.First()
        );
    }

    #endregion
}
