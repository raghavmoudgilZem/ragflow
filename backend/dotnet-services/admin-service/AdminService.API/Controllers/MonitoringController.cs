using AdminService.Core.Interfaces;
using AdminService.Domain.DTOs.Monitoring;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Ragflow.AdminService.Domain.DTOs;

namespace Ragflow.AdminService.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/monitoring")]
public sealed class MonitoringController : ControllerBase
{
    private readonly IMonitoringService _monitoringService;

    public MonitoringController(IMonitoringService monitoringService)
    {
        _monitoringService = monitoringService;
    }

    private string? Authorization => HttpContext.Request.Headers.Authorization.ToString();

    // =====================================================
    // GET PLATFORM HEALTH
    // =====================================================

    [HttpGet("health")]
    public async Task<IActionResult> GetPlatformHealth(CancellationToken cancellationToken)
    {
        var response = await _monitoringService.GetPlatformHealthAsync(
            Authorization,
            cancellationToken
        );

        if (!response.Success)
        {
            return BadRequest(
                ApiResponse<MonitoringHealthResponseDto>.ErrorResponse(response.Errors)
            );
        }

        return Ok(ApiResponse<MonitoringHealthResponseDto>.SuccessResponse(response.Data));
    }
}
