using FluentValidation;
using Ragflow.FileService.Core.DTOs.Requests;

namespace Ragflow.FileService.Core.Validators;

public class RenameFileRequestValidator : AbstractValidator<RenameFileRequest>
{
    public RenameFileRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255);
    }
}