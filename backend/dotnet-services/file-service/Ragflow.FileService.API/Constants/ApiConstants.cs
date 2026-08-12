namespace Ragflow.FileService.API.Constants;

public static class ApiRoutes
{
    public const string Version = "api/v1";
    public const string Base = Version + "/files";

    public const string ById = "{id:guid}";
    public const string Rename = "{id:guid}/rename";
    public const string Download = "{id:guid}/download";
    public const string Parent = "{id:guid}/parent";
    public const string Ancestors = "{id:guid}/ancestors";
    public const string BulkDelete = "bulk-delete";
    public const string BulkMove = "bulk-move";
    public const string BulkCopy = "bulk-copy";
}