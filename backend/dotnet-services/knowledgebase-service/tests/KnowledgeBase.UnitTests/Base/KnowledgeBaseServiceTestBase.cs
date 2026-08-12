using FluentValidation;
using KnowledgeBase.Application.DTOs.Dataset;
using KnowledgeBase.Application.Interfaces.Repositories;
using KnowledgeBase.Application.Services;
using KnowledgeBase.Application.Validators;
using Microsoft.Extensions.Logging;
using Moq;

public abstract class KnowledgeBaseServiceTestBase
{
    protected readonly Mock<IKnowledgeBaseRepository> RepositoryMock;
    // protected readonly Mock<ICurrentUserContext> CurrentUserContextMock;
    protected readonly Mock<ILogger<KnowledgeBaseService>> LoggerMock;

    protected readonly IValidator<CreateDatasetRequest> CreateValidator;
    protected readonly IValidator<GetDatasetsRequest> GetValidator;
    protected readonly IValidator<UpdateDatasetRequest> UpdateValidator;

    protected readonly KnowledgeBaseService Service;

    protected KnowledgeBaseServiceTestBase()
    {
        RepositoryMock = new Mock<IKnowledgeBaseRepository>();



        LoggerMock = new Mock<ILogger<KnowledgeBaseService>>();

        CreateValidator = new CreateDatasetValidator();

        GetValidator = new GetDatasetsValidator();

        UpdateValidator = new UpdateDatasetValidator();



        Service = new KnowledgeBaseService(
            RepositoryMock.Object,

            CreateValidator,
             LoggerMock.Object,
            GetValidator,
            UpdateValidator
           );
    }


}