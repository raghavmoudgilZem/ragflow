using Document.Application.DTOs.Common;
using Document.Application.DTOs.Requests;

namespace Document.Application.Tests.TestData;

public static class CreateDocumentRequests
{
    public static CreateDocumentRequest Valid()
    {
        return new CreateDocumentRequest
        {
            KnowledgeBaseId = Guid.NewGuid(),

            Name = "Employee Handbook",

            Description = "HR Policy",

            ParserId = "default",

            ParseImmediately = true,

            File = new FileUploadRequest
            {
                FileName = "Employee.pdf",

                ContentType = "application/pdf",

                Length = 1000,

                Content = new MemoryStream(new byte[1000])
            }
        };
    }
}