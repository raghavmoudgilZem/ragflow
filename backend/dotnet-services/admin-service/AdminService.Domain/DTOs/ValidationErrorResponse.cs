using System.Text.Json.Serialization;

namespace Ragflow.AdminService.Domain.DTOs;

public class ValidationErrorResponse
{
    [JsonPropertyName("errors")]
    public Dictionary<string, string[]>? Errors { get; set; }
}
