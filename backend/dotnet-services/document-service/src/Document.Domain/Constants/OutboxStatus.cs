namespace Ragflow.Identity.Domain.Common.Constants;

public static class OutboxStatus
{
    public const string Pending = "Pending";

    public const string Processing = "Processing";

    public const string Processed = "Processed";

    public const string Failed = "Failed";
}