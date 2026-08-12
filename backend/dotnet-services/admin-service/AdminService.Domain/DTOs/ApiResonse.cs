namespace Ragflow.AdminService.Domain.DTOs;

public sealed class ApiResponse<T>
{
    public bool Success { get; set; }

    public List<string> Errors { get; set; } = [];

    public T? Data { get; set; }

    public static ApiResponse<T> SuccessResponse(T data)
    {
        return new ApiResponse<T> { Success = true, Data = data };
    }

    public static ApiResponse<T> ErrorResponse(string error)
    {
        return new ApiResponse<T> { Success = false, Errors = [error] };
    }

    public static ApiResponse<T> ErrorResponse(IEnumerable<string> errors)
    {
        return new ApiResponse<T> { Success = false, Errors = errors.ToList() };
    }
}
