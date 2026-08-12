namespace Ragflow.AdminService.Domain.DTOs;

public class IdentityErrorResponse
{
    public string? Title { get; set; }
    public int Status { get; set; }
    public Dictionary<string, string[]>? Errors { get; set; }
}
