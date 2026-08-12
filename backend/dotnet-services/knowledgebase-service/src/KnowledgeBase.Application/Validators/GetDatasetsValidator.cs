using FluentValidation;
using KnowledgeBase.Application.DTOs.Dataset;

namespace KnowledgeBase.Application.Validators;

public sealed class GetDatasetsValidator
    : AbstractValidator<GetDatasetsRequest>
{
    private static readonly string[] AllowedSortColumns =
    [
        "Name",
        "CreatedAt",
        "UpdatedAt"
    ];

    public GetDatasetsValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("Page number must be greater than zero.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.SortOrder)
            .Must(x =>
                string.Equals(x, "asc", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(x, "desc", StringComparison.OrdinalIgnoreCase))
            .WithMessage("SortOrder must be either 'asc' or 'desc'.");

        RuleFor(x => x.SortBy)
            .Must(x => AllowedSortColumns.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Invalid SortBy column.");
    }
}