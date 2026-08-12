using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Ragflow.FileService.API.Middlewares;
using Ragflow.FileService.Core.Exceptions;

namespace Ragflow.FileService.Tests.Middlewares;

[TestFixture]
public class ExceptionMiddlewareTests
{
    private Mock<ILogger<ExceptionMiddleware>> _logger = null!;

    [SetUp]
    public void Setup()
    {
        _logger = new Mock<ILogger<ExceptionMiddleware>>();
    }

    [Test]
    public async Task InvokeAsync_Should_Call_Next_When_No_Exception()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        var middleware = new ExceptionMiddleware(
            _ => Task.CompletedTask,
            _logger.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.That(context.Response.StatusCode, Is.EqualTo(StatusCodes.Status200OK));
    }

    [Test]
    public async Task InvokeAsync_Should_Return_NotFound_For_BusinessException()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        var middleware = new ExceptionMiddleware(
            _ => throw new BusinessException(
                "File not found",
                HttpStatusCode.NotFound),
            _logger.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.That(context.Response.StatusCode,
            Is.EqualTo(StatusCodes.Status404NotFound));

        context.Response.Body.Position = 0;

        using var reader = new StreamReader(context.Response.Body);
        var json = await reader.ReadToEndAsync();

        using var document = JsonDocument.Parse(json);

        Assert.That(
            document.RootElement.GetProperty("message").GetString(),
            Is.EqualTo("File not found"));

        Assert.That(
            document.RootElement.GetProperty("statusCode").GetInt32(),
            Is.EqualTo(StatusCodes.Status404NotFound));
    }

    [Test]
    public async Task InvokeAsync_Should_Return_Unauthorized_For_UnauthorizedAccessException()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        var middleware = new ExceptionMiddleware(
            _ => throw new UnauthorizedAccessException(),
            _logger.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.That(context.Response.StatusCode,
            Is.EqualTo(StatusCodes.Status401Unauthorized));

        context.Response.Body.Position = 0;

        using var reader = new StreamReader(context.Response.Body);
        var json = await reader.ReadToEndAsync();

        using var document = JsonDocument.Parse(json);

        Assert.That(
            document.RootElement.GetProperty("message").GetString(),
            Is.EqualTo("Authentication required."));

        Assert.That(
            document.RootElement.GetProperty("statusCode").GetInt32(),
            Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

    [Test]
    public async Task InvokeAsync_Should_Return_InternalServerError_For_Unexpected_Exception()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        var middleware = new ExceptionMiddleware(
            _ => throw new Exception("Unexpected"),
            _logger.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.That(context.Response.StatusCode,
            Is.EqualTo(StatusCodes.Status500InternalServerError));

        context.Response.Body.Position = 0;

        using var reader = new StreamReader(context.Response.Body);
        var json = await reader.ReadToEndAsync();

        using var document = JsonDocument.Parse(json);

        Assert.That(
            document.RootElement.GetProperty("message").GetString(),
            Is.EqualTo("Unexpected server error."));

        Assert.That(
            document.RootElement.GetProperty("statusCode").GetInt32(),
            Is.EqualTo(StatusCodes.Status500InternalServerError));
    }
}