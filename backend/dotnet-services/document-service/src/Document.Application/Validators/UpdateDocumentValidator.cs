using Document.Application.DTOs.Common;
using Document.Application.DTOs.Requests;
using Document.Domain.Constants;
using FluentValidation;

namespace Document.Application.Validators;

public sealed class UpdateDocumentValidator
    : AbstractValidator<UpdateDocumentRequest>
{
    private static readonly string[] AllowedExtensions =
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

    private const long MaxFileSize = 100 * 1024 * 1024; // 100 MB

    public UpdateDocumentValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Document name is required.")
            .MaximumLength(DocumentConstants.MaxNameLength);

        RuleFor(x => x.Description)
            .MaximumLength(DocumentConstants.MaxDescriptionLength)
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.ParserId)
            .NotEmpty()
            .WithMessage("Parser is required.");

        // Validate file only when provided

        When(x => x.File is not null, () =>
        {
            RuleFor(x => x.File!)
                .Must(BeValidFile)
                .WithMessage("Uploaded file is invalid.");

            RuleFor(x => x.File!)
                .Must(HaveAllowedExtension)
                .WithMessage("Unsupported file type.");

            RuleFor(x => x.File!)
                .Must(BeWithinFileSizeLimit)
                .WithMessage(
                    $"Maximum allowed file size is {MaxFileSize / (1024 * 1024)} MB.");
        });
    }

    private static bool BeValidFile(FileUploadRequest file)
    {
        return file.Content.Length > 0;
    }

    private static bool HaveAllowedExtension(FileUploadRequest file)
    {
        var extension = Path.GetExtension(file.FileName);

        return AllowedExtensions.Contains(
            extension,
            StringComparer.OrdinalIgnoreCase);
    }

    private static bool BeWithinFileSizeLimit(FileUploadRequest file)
    {
        return file.Content.Length <= MaxFileSize;
    }
}