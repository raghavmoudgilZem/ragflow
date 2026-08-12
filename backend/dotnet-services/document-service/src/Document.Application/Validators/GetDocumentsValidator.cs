using Document.Application.DTOs.Requests;
using FluentValidation;

namespace Document.Application.Validators;

public sealed class GetDocumentsValidator
    : AbstractValidator<GetDocumentsRequest>
{
    private static readonly string[] AllowedSortFields =
    {
        "Name",
        "CreatedAt",
        "UpdatedAt",
        "Status"
    };

    public GetDocumentsValidator()
    {
        RuleFor(x => x.KnowledgeBaseId)
            .NotEmpty()
            .WithMessage("Knowledge Base Id is required.");

        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.SortOrder)
            .Must(x => x.Equals("asc", StringComparison.OrdinalIgnoreCase)
                    || x.Equals("desc", StringComparison.OrdinalIgnoreCase))
            .WithMessage("SortOrder must be either 'asc' or 'desc'.");

        RuleFor(x => x.SortBy)
            .Must(x => AllowedSortFields.Contains(x))
            .WithMessage("Invalid SortBy field.");
    }
}