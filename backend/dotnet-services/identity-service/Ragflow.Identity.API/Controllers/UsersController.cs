using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ragflow.Identity.Application.DTOs;

[ApiController]
[Route("api/v1/users")]
[Authorize]
public sealed class UsersController
    : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(
        IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] GetUsersRequestDto request,
        CancellationToken cancellationToken)
    {
        var result =
            await _userService
                .GetUsersAsync(
                    request,
                    cancellationToken);

        return Ok(result);
    }
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUser(
       Guid userId,
       CancellationToken cancellationToken)
    {
        var result =
            await _userService.GetUserAsync(
                userId,
                cancellationToken);

        return Ok(result);
    }

    [HttpPut("{userId}/disable")]
    public async Task<IActionResult> DisableUser(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result = await _userService.DisableUserAsync(
             userId,
             cancellationToken);

        return Ok(result);
    }

    [HttpPut("{userId}/enable")]
    public async Task<IActionResult> EnableUser(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result = await _userService.EnableUserAsync(
            userId,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{userId}/tenants")]
    public async Task<IActionResult> GetUserTenants(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result =
            await _userService.GetUserTenantsAsync(
                userId,
                cancellationToken);

        return Ok(result);
    }
}