using FluentValidation;
using Ragflow.FileService.Core.DTOs.Requests;

namespace Ragflow.FileService.Core.Validators;

public class GetFilesRequestValidator : AbstractValidator<GetFilesRequest>
{
    public GetFilesRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.SortOrder)
            .Must(x => string.IsNullOrWhiteSpace(x)
                || x.Equals("ASC", StringComparison.OrdinalIgnoreCase)
                || x.Equals("DESC", StringComparison.OrdinalIgnoreCase))
            .WithMessage("SortOrder must be ASC or DESC.");
    }
}