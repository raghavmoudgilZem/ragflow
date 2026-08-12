using AdminService.Core.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ragflow.AdminService.Domain.DTOs;

namespace Ragflow.AdminService.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/users")]
public sealed class UsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public UsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    private string? Authorization => HttpContext.Request.Headers.Authorization.ToString();

    // =====================================================
    // GET USERS
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] GetUsersRequestDto request,
        CancellationToken cancellationToken
    )
    {
        var response = await _usersService.GetUsersAsync(request, Authorization, cancellationToken);

        if (!response.Success)
        {
            return BadRequest(ApiResponse<PagedUserResponseDto>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<PagedUserResponseDto>.SuccessResponse(response.Data));
    }

    // =====================================================
    // GET USER DETAILS
    // =====================================================

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetUser(Guid userId, CancellationToken cancellationToken)
    {
        var response = await _usersService.GetUserAsync(userId, Authorization, cancellationToken);

        if (!response.Success)
        {
            return BadRequest(ApiResponse<UserDetailsDto>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<UserDetailsDto>.SuccessResponse(response.Data));
    }

    // =====================================================
    // ENABLE USER
    // =====================================================

    [HttpPut("{userId}/enable")]
    public async Task<IActionResult> EnableUser(string userId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return BadRequest(ApiResponse<UserEnableDisableDto>.ErrorResponse("Invalid user id."));
        }

        var response = await _usersService.EnableUserAsync(
            parsedUserId,
            Authorization,
            cancellationToken
        );

        if (!response.Success)
        {
            return BadRequest(ApiResponse<UserEnableDisableDto>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<UserEnableDisableDto>.SuccessResponse(response.Data));
    }

    // =====================================================
    // DISABLE USER
    // =====================================================

    [HttpPut("{userId}/disable")]
    public async Task<IActionResult> DisableUser(string userId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return BadRequest(ApiResponse<UserEnableDisableDto>.ErrorResponse("Invalid user id."));
        }

        var response = await _usersService.DisableUserAsync(
            parsedUserId,
            Authorization,
            cancellationToken
        );

        if (!response.Success)
        {
            return BadRequest(ApiResponse<UserEnableDisableDto>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<UserEnableDisableDto>.SuccessResponse(response.Data));
    }

    // =====================================================
    // GET USER TENANTS
    // =====================================================

    [HttpGet("{userId:guid}/tenants")]
    public async Task<IActionResult> GetUserTenants(
        Guid userId,
        CancellationToken cancellationToken
    )
    {
        var response = await _usersService.GetUserTenantsAsync(
            userId,
            Authorization,
            cancellationToken
        );

        if (!response.Success)
        {
            return BadRequest(ApiResponse<List<UserTenantDto>>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<List<UserTenantDto>>.SuccessResponse(response.Data));
    }
}
