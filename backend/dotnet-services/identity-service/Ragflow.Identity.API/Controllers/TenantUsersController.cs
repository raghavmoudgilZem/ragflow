using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ragflow.Identity.Application.DTOs;

[ApiController]
[Route("api/v1/tenants")]
[Authorize]
public sealed class TenantUsersController : ControllerBase
{
    private readonly ITenantUserService _tenantUserService;
    public TenantUsersController(ITenantUserService tenantUserService)
    {
       
        _tenantUserService = tenantUserService;
    }



    [HttpPost("users/invite")]
    // [Authorize]
    public async Task<IActionResult> InviteUser(
        [FromBody] InviteUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var tenantId = Guid.Parse(
       User.FindFirstValue("tenantId")!);
        var currentUserId = Guid.Parse(
               User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _tenantUserService.InviteUserAsync(
            tenantId,
currentUserId,
            request,
            cancellationToken);

        return Ok(result);
    }


    [HttpDelete("users")]
    public async Task<IActionResult> RemoveUser(

           [FromBody] RemoveTenantUserRequestDto request,
           CancellationToken cancellationToken)
    {
        var tenantId = Guid.Parse(
    User.FindFirstValue("tenantId")!);

        var currentUserId = Guid.Parse(
               User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        await _tenantUserService.RemoveUserAsync(
            tenantId,
            currentUserId,
            request,
            cancellationToken);

        return Ok(new
        {
            success = true
        });
    }


    [HttpGet]
    public async Task<IActionResult> GetUsers(
        CancellationToken cancellationToken)
    {
        var tenantId = Guid.Parse(
            User.FindFirstValue("tenantId")!);

        var currentUserId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result =
            await _tenantUserService.GetTenantUsersAsync(
                tenantId,
                currentUserId,
                cancellationToken);

        return Ok(result);
    }

}





