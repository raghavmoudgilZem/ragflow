using Document.Application.DTOs.Requests;
using FluentValidation;

namespace Document.Application.Validators;

public sealed class DeleteDocumentValidator
    : AbstractValidator<DeleteDocumentsRequest>
{
    public DeleteDocumentValidator()
    {
        RuleFor(x => x.DocumentIds)
            .NotEmpty()
            .WithMessage("DocumentIds are required.");
    }
}