public sealed class ApiResponse<T>
{
    public bool Success { get; set; }

    public List<string> Errors { get; set; } = [];

    public T? Data { get; set; }

   
}