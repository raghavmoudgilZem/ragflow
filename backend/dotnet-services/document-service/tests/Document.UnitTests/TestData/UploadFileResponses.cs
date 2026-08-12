using Document.Application.DTOs.External;

namespace Document.Application.Tests.TestData;

public static class UploadFileResponses
{
    public static UploadFileResponse Valid()
    {
        return new UploadFileResponse
        {
            FileId = Guid.NewGuid(),
            FileName = "Employee.pdf",
            FileSize = 1000,
            ContentType = "application/pdf"
        };
    }
}