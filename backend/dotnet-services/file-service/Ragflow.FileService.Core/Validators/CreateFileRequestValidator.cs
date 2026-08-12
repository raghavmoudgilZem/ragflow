using FluentValidation;
using Ragflow.FileService.Core.DTOs.Requests;

namespace Ragflow.FileService.Core.Validators;

public class CreateFileRequestValidator : AbstractValidator<CreateFileRequest>
{
    public CreateFileRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(255);

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Invalid file type.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.ParentId)
            .NotEqual(Guid.Empty)
            .When(x => x.ParentId.HasValue)
            .WithMessage("ParentId cannot be an empty GUID.");
    }
}