using AdminService.Domain.DTOs.Monitoring;
using Ragflow.AdminService.Domain.DTOs;

namespace AdminService.Core.Interfaces;

public interface IMonitoringService
{
    Task<ApiResponse<MonitoringHealthResponseDto>> GetPlatformHealthAsync(
        string? authorization,
        CancellationToken cancellationToken
    );
}
