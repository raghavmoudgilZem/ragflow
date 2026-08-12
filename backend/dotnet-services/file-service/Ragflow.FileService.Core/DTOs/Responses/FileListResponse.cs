
namespace Ragflow.FileService.Core.DTOs.Responses;

public class FileListResponse
{
    public int TotalRecords { get; set; }

    public int Page { get; set; }

    public int PageSize { get; set; }

    public List<FileResponse> Files { get; set; } = [];
}