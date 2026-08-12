using Document.Application.DTOs.Common;
using Document.Application.DTOs.Requests;
using Document.Domain.Constants;
using FluentValidation;

namespace Document.Application.Validators;

public sealed class CreateDocumentValidator
    : AbstractValidator<CreateDocumentRequest>
{
    public CreateDocumentValidator()
    {
        RuleFor(x => x.KnowledgeBaseId)
            .NotEmpty()
            .WithMessage("Knowledge Base Id is required.");

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

        RuleFor(x => x.File)
            .NotNull()
            .WithMessage("File is required.");

        RuleFor(x => x.File)
            .Must(BeValidFile)
            .WithMessage("Uploaded file is invalid.")
            .When(x => x.File != null);

        RuleFor(x => x.File)
            .Must(HaveAllowedExtension)
            .WithMessage("Unsupported file type.")
            .When(x => x.File != null);

        RuleFor(x => x.File)
            .Must(BeWithinFileSizeLimit)
            .WithMessage($"Maximum allowed file size is {DocumentConstants.MaxFileSize / (1024 * 1024)} MB.")
            .When(x => x.File != null);
    }

    private static bool BeValidFile(FileUploadRequest file)
    {
        return file.Length > 0;
    }

    private static bool HaveAllowedExtension(FileUploadRequest file)
    {
        var extension = Path.GetExtension(file.FileName);

        return DocumentConstants.AllowedFileExtensions.Contains(
            extension,
            StringComparer.OrdinalIgnoreCase);
    }

    private static bool BeWithinFileSizeLimit(FileUploadRequest file)
    {
        return file.Length <= DocumentConstants.MaxFileSize;
    }
}