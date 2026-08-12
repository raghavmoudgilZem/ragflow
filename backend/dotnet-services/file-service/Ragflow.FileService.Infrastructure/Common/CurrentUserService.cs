using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Ragflow.FileService.Core.Interfaces;
using System.Reflection.Emit;
using Ragflow.FileService.Core.Exceptions;
using System.Net;
using Ragflow.FileService.Core.Constants;

namespace Ragflow.FileService.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetUserId()
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new BusinessException(
                ExceptionConstants.UserNotAuthenticated,
                HttpStatusCode.Unauthorized);
        }

        var userId =
            user.FindFirst("sub")?.Value ??
            user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userId, out var id))
        {
            throw new BusinessException(
                ExceptionConstants.UserIdClaimNotFound,
                HttpStatusCode.Unauthorized);
        }

        return id;
    }
}