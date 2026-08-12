using System.Security.Claims;
using System.Text.Json;
using AdminService.Core.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ragflow.AdminService.Domain.DTOs;

namespace Ragflow.AdminService.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // =====================================================
    // LOGIN
    // =====================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto request,
        CancellationToken cancellationToken
    )
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(ApiResponse<LoginUserDto>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<LoginUserDto>.SuccessResponse(response.Data));
    }

    // =====================================================
    // REFRESH TOKEN
    // =====================================================

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequestDto request,
        CancellationToken cancellationToken
    )
    {
        var response = await _authService.RefreshAsync(request, cancellationToken);

        if (!response.Success)
        {
            return BadRequest(ApiResponse<RefreshTokenResponseDto>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<RefreshTokenResponseDto>.SuccessResponse(response.Data));
    }

    // =====================================================
    // LOGOUT
    // =====================================================

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequestDto request,
        CancellationToken cancellationToken
    )
    {
        var response = await _authService.LogoutAsync(request, cancellationToken);

        if (!response.Success)
        {
            return BadRequest(ApiResponse<LogoutResponseDto>.ErrorResponse(response.Errors));
        }

        return Ok(ApiResponse<LogoutResponseDto>.SuccessResponse(response.Data));
    }
}
