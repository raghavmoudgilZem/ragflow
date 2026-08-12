using FluentValidation;
using KnowledgeBase.Application.DTOs.Dataset;

namespace KnowledgeBase.Application.Validators;

public sealed class UpdateDatasetValidator
    : AbstractValidator<UpdateDatasetRequest>
{
    public UpdateDatasetValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.Language)
            .NotEmpty();

        RuleFor(x => x.Permission)
            .NotEmpty();

        // RuleFor(x => x.EmbeddingModel)
        //     .NotEmpty();

        // RuleFor(x => x.ParserId)
        //     .NotEmpty();

        // RuleFor(x => x.ChunkMethod)
        //     .NotEmpty();
    }
}