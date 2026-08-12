using Document.Application.DTOs.Requests;
using FluentValidation;

namespace Document.Application.Validators;

public sealed class ParseDocumentsValidator
    : AbstractValidator<ParseDocumentsRequest>
{
    public ParseDocumentsValidator()
    {
        RuleFor(x => x.DocumentIds)
            .NotNull()
            .WithMessage("DocumentIds are required.");

        RuleFor(x => x.DocumentIds)
            .NotEmpty()
            .WithMessage("At least one document must be selected.");

        RuleForEach(x => x.DocumentIds)
            .NotEqual(Guid.Empty)
            .WithMessage("DocumentId cannot be empty.");

        RuleFor(x => x.DocumentIds)
            .Must(HaveUniqueIds)
            .WithMessage("Duplicate document ids are not allowed.");
    }

    private static bool HaveUniqueIds(List<Guid> documentIds)
    {
        return documentIds.Distinct().Count() == documentIds.Count;
    }
}