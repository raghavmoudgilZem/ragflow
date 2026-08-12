namespace Document.Domain.Constants;

public static class DocumentConstants
{
    public const int MaxNameLength = 255;

    public const int MaxDescriptionLength = 1000;

    public const long MaxFileSize = 100 * 1024 * 1024;

    public static readonly string[] AllowedFileExtensions =
    {
        ".pdf",
        ".doc",
        ".docx",
        ".txt",
        ".md",
        ".csv",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".json",
        ".xml"
    };
}