using System.Net;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Moq;
using NUnit.Framework;
using Ragflow.FileService.API.Services;
using Ragflow.FileService.Core.Constants;
using Ragflow.FileService.Core.Exceptions;

namespace Ragflow.FileService.Tests.Services;

[TestFixture]
public class CurrentUserServiceTests
{
    private Mock<IHttpContextAccessor> _httpContextAccessor = null!;
    private CurrentUserService _service = null!;

    [SetUp]
    public void Setup()
    {
        _httpContextAccessor = new Mock<IHttpContextAccessor>();

        _service = new CurrentUserService(_httpContextAccessor.Object);
    }

    [Test]
    public void GetUserId_Should_Return_UserId_When_Sub_Claim_Exists()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var claims = new[]
        {
            new Claim("sub", userId.ToString())
        };

        var identity = new ClaimsIdentity(claims, TestData.TestConstants.ValidFileName);
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext
        {
            User = principal
        };

        _httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns(context);

        // Act
        var result = _service.GetUserId();

        // Assert
        Assert.That(result, Is.EqualTo(userId));
    }

    [Test]
    public void GetUserId_Should_Return_UserId_When_NameIdentifier_Claim_Exists()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };

        var identity = new ClaimsIdentity(claims, TestData.TestConstants.ValidFileName);
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext
        {
            User = principal
        };

        _httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns(context);

        // Act
        var result = _service.GetUserId();

        // Assert
        Assert.That(result, Is.EqualTo(userId));
    }

    [Test]
    public void GetUserId_Should_Throw_When_User_Is_Not_Authenticated()
    {
        // Arrange
        var identity = new ClaimsIdentity();
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext
        {
            User = principal
        };

        _httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns(context);

        // Act & Assert
        var ex = Assert.Throws<BusinessException>(() =>
            _service.GetUserId());

        Assert.That(ex!.Message,
            Is.EqualTo(ExceptionConstants.UserNotAuthenticated));

        Assert.That(ex.StatusCode,
            Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public void GetUserId_Should_Throw_When_HttpContext_Is_Null()
    {
        // Arrange
        _httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns((HttpContext?)null);

        // Act & Assert
        var ex = Assert.Throws<BusinessException>(() =>
            _service.GetUserId());

        Assert.That(ex!.Message,
            Is.EqualTo(ExceptionConstants.UserNotAuthenticated));

        Assert.That(ex.StatusCode,
            Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public void GetUserId_Should_Throw_When_UserId_Claim_Is_Missing()
    {
        // Arrange
        var identity = new ClaimsIdentity(
            [],
            TestData.TestConstants.ValidFileName);

        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext
        {
            User = principal
        };

        _httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns(context);

        // Act & Assert
        var ex = Assert.Throws<BusinessException>(() =>
            _service.GetUserId());

        Assert.That(ex!.Message,
            Is.EqualTo(ExceptionConstants.UserIdClaimNotFound));

        Assert.That(ex.StatusCode,
            Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public void GetUserId_Should_Throw_When_UserId_Is_Not_A_Valid_Guid()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(TestData.TestConstants.UserIdClaimType, TestData.TestConstants.InvalidUserId)
        };

        var identity = new ClaimsIdentity(claims, TestData.TestConstants.ValidFileName);
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext
        {
            User = principal
        };

        _httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns(context);

        // Act & Assert
        var ex = Assert.Throws<BusinessException>(() =>
            _service.GetUserId());

        Assert.That(ex!.Message,
            Is.EqualTo(ExceptionConstants.UserIdClaimNotFound));

        Assert.That(ex.StatusCode,
            Is.EqualTo(HttpStatusCode.Unauthorized));
    }
}