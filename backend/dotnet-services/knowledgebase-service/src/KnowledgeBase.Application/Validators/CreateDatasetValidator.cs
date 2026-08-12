using FluentValidation;
using KnowledgeBase.Application.DTOs.Dataset;

namespace KnowledgeBase.Application.Validators;

public sealed class CreateDatasetValidator
    : AbstractValidator<CreateDatasetRequest>
{
    public CreateDatasetValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Dataset name is required.")
            .MaximumLength(128);

        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.Language)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.Permission)
            .NotEmpty()
            .Must(BeValidPermission)
            .WithMessage("Permission must be either 'Me' or 'Team'.");

        // RuleFor(x => x.EmbeddingModel)
        //     .NotEmpty()
        //     .MaximumLength(100);

        // RuleFor(x => x.ParserId)
        //     .NotEmpty()
        //     .MaximumLength(50);

        // RuleFor(x => x.ChunkMethod)
        //     .NotEmpty()
        //     .MaximumLength(50);
    }

    private static bool BeValidPermission(string permission)
    {
        return permission.Equals("Me", StringComparison.OrdinalIgnoreCase)
            || permission.Equals("Team", StringComparison.OrdinalIgnoreCase);
    }
}