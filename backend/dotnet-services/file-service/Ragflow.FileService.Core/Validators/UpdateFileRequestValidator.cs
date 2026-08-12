using FluentValidation;
using Ragflow.FileService.Core.DTOs.Requests;

namespace Ragflow.FileService.Core.Validators;

public class UpdateFileRequestValidator : AbstractValidator<UpdateFileRequest>
{
    public UpdateFileRequestValidator()
    {
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}