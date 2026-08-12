using Document.Application.DTOs.External;
using Document.Application.DTOs.Requests;
using Document.Application.DTOs.Responses;
using Document.Application.Exceptions;
using Document.Application.Interfaces.Clients;
using Document.Application.Interfaces.Persistence;
using Document.Application.Interfaces.Repositories;
using Document.Application.Interfaces.Services;
using Document.Domain.Entities;
using Document.Domain.Enums;
using Microsoft.Extensions.Logging;
using TaskStatus = Document.Domain.Enums.TaskStatus;
using MassTransit;
using Document.Application.IntegrationEvents;
// using Document.Contracts.Events;
using Ragflow.Identity.Application.Interfaces;
using Ragflow.Identity.Domain.Entities;
using System.Text.Json;
using Ragflow.Identity.Domain.Common.Constants;
namespace Document.Application.Services;

public sealed class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _documentRepository;

    private readonly IFileDocumentRepository _fileDocumentRepository;

    private readonly IDocumentTaskRepository _documentTaskRepository;

    private readonly IUnitOfWork _unitOfWork;

    private readonly IDatasetServiceClient _datasetServiceClient;

    private readonly IFileServiceClient _fileServiceClient;

    private readonly IParsingServiceClient _parsingServiceClient;

    private readonly ILogger<DocumentService> _logger;
    private readonly IPublishEndpoint _publishEndpoint;

    private readonly IOutboxRepository _outboxRepository;

    public DocumentService(
        IDocumentRepository documentRepository,
        IFileDocumentRepository fileDocumentRepository,
        IDocumentTaskRepository documentTaskRepository,
        IUnitOfWork unitOfWork,
        IDatasetServiceClient datasetServiceClient,
        IFileServiceClient fileServiceClient,
        IParsingServiceClient parsingServiceClient,
        ILogger<DocumentService> logger,
         IPublishEndpoint publishEndpoint,
         IOutboxRepository outboxRepository)
    {
        _documentRepository = documentRepository;
        _fileDocumentRepository = fileDocumentRepository;
        _documentTaskRepository = documentTaskRepository;
        _unitOfWork = unitOfWork;
        _datasetServiceClient = datasetServiceClient;
        _fileServiceClient = fileServiceClient;
        _parsingServiceClient = parsingServiceClient;
        _logger = logger;
        _publishEndpoint = publishEndpoint;
        _outboxRepository = outboxRepository;
    }
    public async Task<CreateDocumentResponse> CreateDocumentAsync(
    CreateDocumentRequest request,
    Guid tenantId,
    Guid userId,
    CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Creating document '{DocumentName}' in KnowledgeBase '{KnowledgeBaseId}'",
            request.Name,
            request.KnowledgeBaseId);

        // Step 1
        await ValidateKnowledgeBaseAsync(
            request.KnowledgeBaseId,
            tenantId,
            cancellationToken);

        // Step 2
        await ValidateDuplicateDocumentAsync(
            request.KnowledgeBaseId,
            tenantId,
            request.Name,
            cancellationToken);


        // Step 3
        // var uploadedFile =
        //     await UploadFileAsync(
        //         request,
        //         tenantId,
        //         userId,
        //         cancellationToken);

        // Step 4
        // var fileid = uploadedFile.FileId;
        
        var fileid = Guid.NewGuid();
        var document =
            CreateDocument(
                request,

                tenantId,
                userId);
        // Remaining implementation
        var fileMapping = CreateFileMapping(
        document.Id,
        fileid,
        userId);

        await _documentRepository.AddAsync(
            document,
            cancellationToken);

        await _fileDocumentRepository.AddAsync(
            fileMapping,
            cancellationToken);

        var parseTask = CreateParseTask(
            request,
            document.Id,
            tenantId,
            userId);

        if (parseTask is not null)
        {
            await _documentTaskRepository.AddAsync(
                parseTask,
                cancellationToken);
        }

        if (request.ParseImmediately)
        {
            var integrationEvent = new ParseDocumentRequestedEvent
            {
                MessageId = Guid.NewGuid(),
                CorrelationId = Guid.NewGuid(),
                TaskId = parseTask.Id,
                DocumentId = parseTask.DocumentId,
                TenantId = tenantId,
                UserId = userId,
                FileId = fileid,
                TaskType = parseTask.TaskType
            };

            var outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                MessageId = integrationEvent.MessageId,
                CorrelationId = integrationEvent.CorrelationId,
                EventType = nameof(ParseDocumentRequestedEvent),
                Payload = JsonSerializer.Serialize(integrationEvent),
                Status = OutboxStatus.Pending,
                RetryCount = 0,
                CreatedOnUtc = DateTime.UtcNow
            };

            await _outboxRepository.AddAsync(outboxMessage, cancellationToken);

        }
        try
        {
            await _unitOfWork.CommitAsync(cancellationToken);
        }
        catch
        {
            // If the commit fails, we should delete the uploaded file to avoid orphaned files.
            // await _fileServiceClient.DeleteFileAsync(
            //     // uploadedFile.FileId,
            //     fileid,
            //     cancellationToken);

            throw;
        }
        return new CreateDocumentResponse
        {
            DocumentId = document.Id,

            KnowledgeBaseId = document.KnowledgeBaseId,

            Name = document.Name,
            FileId = fileid,
            TaskId = parseTask?.Id,
            Message = "Document created successfully.",
            ParsingStarted = request.ParseImmediately


        };

    }
    public async Task<PagedResponse<GetDocumentResponse>> GetDocumentsAsync(
    GetDocumentsRequest request,
    Guid tenantId,
    CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Retrieving documents for Knowledge Base: {KnowledgeBaseId}",
            request.KnowledgeBaseId);

        var documents = await _documentRepository.GetDocumentsAsync(
            tenantId,
            request,
            cancellationToken);

        _logger.LogInformation(
            "Retrieved {Count} documents.",
            documents.TotalCount);

        return documents;
    }
    private async Task ValidateKnowledgeBaseAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var knowledgeBase =
            await _datasetServiceClient.GetKnowledgeBaseAsync(
                knowledgeBaseId,
                tenantId,
                cancellationToken);

        if (knowledgeBase is null)
        {
            throw new DatasetNotFoundException(knowledgeBaseId);
        }

        if (knowledgeBase.Status != "Active")
        {
            throw new InvalidOperationException(
                $"Knowledge Base '{knowledgeBase.Name}' is inactive.");
        }
    }
    private async Task ValidateDuplicateDocumentAsync(
        Guid knowledgeBaseId,
        Guid tenantId,
        string documentName,
        CancellationToken cancellationToken)
    {
        var existingDocument =
            await _documentRepository.GetByNameAsync(
                knowledgeBaseId,
                tenantId,
                documentName,
                cancellationToken);

        if (existingDocument is not null)
        {
            throw new DuplicateDocumentException(documentName);
        }
    }
    private async Task<UploadFileResponse> UploadFileAsync(
        CreateDocumentRequest request,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Uploading file '{FileName}'",
            request.File.FileName);

        var uploadedFile =
            await _fileServiceClient.UploadFileAsync(
                request.File,
                tenantId,
                userId,
                cancellationToken);

        _logger.LogInformation(
            "File uploaded successfully. FileId: {FileId}",
            uploadedFile.FileId);

        return uploadedFile;
    }
    private static Domain.Entities.Document CreateDocument(
        CreateDocumentRequest request,

        Guid tenantId,
        Guid userId)
    {
        return new Domain.Entities.Document
        {
            Id = Guid.NewGuid(),

            TenantId = tenantId,

            KnowledgeBaseId = request.KnowledgeBaseId,

            Name = request.Name,

            Description = request.Description,
            ParserType = ParserType.Default,

            // ParserId = request.ParserId,

            Status = request.ParseImmediately
                ? DocumentStatus.Enabled
                : DocumentStatus.Disabled,

            CreatedBy = userId,

            CreatedAt = DateTime.UtcNow,

            UpdatedBy = userId,

            UpdatedAt = DateTime.UtcNow
        };
    }
    private static File2Document CreateFileMapping(
        Guid documentId,
        Guid fileId,
        Guid userId)
    {
        return new File2Document
        {


            DocumentId = documentId,

            FileId = fileId,


        };
    }
    private static DocumentTask CreateParseTask(
        CreateDocumentRequest request,
        Guid documentId,
        Guid tenantId,
        Guid userId)
    {
        if (!request.ParseImmediately)
            return null;

        return new DocumentTask
        {
            Id = Guid.NewGuid(),

            TenantId = tenantId,

            DocumentId = documentId,

            TaskType = TaskType.Parse,

            Status = TaskStatus.Pending,

            CreatedBy = userId,

            CreatedAt = DateTime.UtcNow
        };
    }
    public async Task<GetDocumentByIdResponse> GetDocumentByIdAsync(
    Guid documentId,
    Guid tenantId,
    CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Retrieving document {DocumentId} for tenant {TenantId}.",
            documentId,
            tenantId);

        var document = await _documentRepository.GetByIdAsync(
            documentId,
            tenantId,
            cancellationToken);

        if (document is null)
        {
            _logger.LogWarning(
                "Document {DocumentId} not found for tenant {TenantId}.",
                documentId,
                tenantId);

            throw new DocumentNotFoundException(documentId);
        }

        _logger.LogInformation(
            "Successfully retrieved document {DocumentId}.",
            documentId);

        return document;
    }
    public async Task<UpdateDocumentResponse> UpdateDocumentAsync(
        Guid documentId,
        UpdateDocumentRequest request,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // 1. Load document
        var document = await _documentRepository.GetByIdForUpdateAsync(
        documentId,
        tenantId,
        cancellationToken);

        if (document is null)
        {
            throw new DocumentNotFoundException(documentId);
        }

        // 2. Validate duplicate name
        if (!string.Equals(
            document.Name,
            request.Name,
            StringComparison.OrdinalIgnoreCase))
        {
            var exists = await _documentRepository.ExistsByNameAsync(
                document.KnowledgeBaseId,
                tenantId,
                request.Name,
                documentId,
                cancellationToken);

            if (exists)
            {
                throw new DuplicateDocumentException(request.Name);
            }
        }
        var newFileId = Guid.NewGuid();
        // 3. Replace file (optional)
        if (request.File is not null)
        {

            // var fileResponse =
            //     await _fileServiceClient.UploadFileAsync(
            //         request.File,
            //         tenantId,
            //         userId,
            //         cancellationToken);
            // newFileId = fileResponse.FileId;
            var existingMapping =
                await _fileDocumentRepository.GetByDocumentIdAsync(
                    document.Id,
                    cancellationToken);

            if (existingMapping is not null)
            {
                // await _fileServiceClient.DeleteFileAsync(
                //     existingMapping.FileId,
                //     cancellationToken);

                existingMapping.FileId = newFileId;

                await _fileDocumentRepository.UpdateAsync(existingMapping);
            }
        }

        // 4. Update metadata
        document.Name = request.Name;

        document.Description = request.Description;

        document.ParserType = ParserType.Default;

        document.UpdatedAt = DateTime.UtcNow;

        _documentRepository.Update(document);

        // 5. Save changes


        // 6. Trigger parsing (optional)
        if (request.ParseImmediately)
        {
            // await _parsingServiceClient.StartParsingAsync(
            //      document.Id ,
            //     tenantId,
            //     userId,
            //     cancellationToken);

            var task = new DocumentTask
            {
                Id = Guid.NewGuid(),

                DocumentId = document.Id,

                Status = TaskStatus.Pending,

                CreatedBy = userId,

                CreatedAt = DateTime.UtcNow,
                TaskType = TaskType.Parse
            };
            await _documentTaskRepository.AddAsync(
              task,
              cancellationToken);

            var integrationEvent = new ParseDocumentRequestedEvent
            {
                MessageId = Guid.NewGuid(),
                CorrelationId = Guid.NewGuid(),
                TaskId = task.Id,
                DocumentId = task.DocumentId,
                TenantId = tenantId,
                UserId = userId,
                FileId = newFileId,
                TaskType = task.TaskType
            };

            var outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                MessageId = integrationEvent.MessageId,
                CorrelationId = integrationEvent.CorrelationId,
                EventType = nameof(ParseDocumentRequestedEvent),
                Payload = JsonSerializer.Serialize(integrationEvent),
                Status = OutboxStatus.Pending,
                RetryCount = 0,
                CreatedOnUtc = DateTime.UtcNow
            };

            await _outboxRepository.AddAsync(outboxMessage, cancellationToken);
        }
        await _unitOfWork.CommitAsync(cancellationToken);
        // 7. Return response
        return new UpdateDocumentResponse
        {
            Id = document.Id,
            Message = "Document updated successfully."
        };
    }

    public async Task<ParseDocumentsResponse> ParseDocumentsAsync(
        ParseDocumentsRequest request,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // 1. Load documents
        Console.WriteLine($"Service Count: {request.DocumentIds.Count}");

        foreach (var id in request.DocumentIds)
        {
            Console.WriteLine($"Service Id: {id}");
        }
        var documents = await _documentRepository.GetByIdsAsync(
        request.DocumentIds,
        tenantId,
        cancellationToken);
        Console.WriteLine($"Loaded {documents.Count} documents for parsing.");
        Console.WriteLine($"request.DocumentIds: {string.Join(", ", request.DocumentIds)}");
        Console.WriteLine($"tenantId: {tenantId}");
        // 2. Validate existence
        var response = new ParseDocumentsResponse();

        var documentDictionary = documents.ToDictionary(x => x.Id);

        foreach (var documentId in request.DocumentIds)
        {
            if (!documentDictionary.ContainsKey(documentId))
            {
                response.FailedDocuments.Add(new ParseDocumentFailure
                {
                    DocumentId = documentId,
                    Reason = "Document not found."
                });
            }
        }

        // 3. Validate document status
        var documentsToParse = new List<Domain.Entities.Document>();

        foreach (var document in documents)
        {

            if (document.Status == DocumentStatus.Disabled)
            {
                response.FailedDocuments.Add(new ParseDocumentFailure
                {
                    DocumentId = document.Id,
                    Reason = "Document is disabled."
                });

                continue;
            }

            var hasActiveTask =
                await _documentTaskRepository.HasActiveParseTaskAsync(
                    document.Id,
                    cancellationToken);

            if (hasActiveTask)
            {
                response.FailedDocuments.Add(new ParseDocumentFailure
                {
                    DocumentId = document.Id,
                    Reason = "Document is already being parsed."
                });

                continue;
            }

            documentsToParse.Add(document);

        }
        Console.WriteLine($"documentsToParse: {documentsToParse.Count} documents for parsing.");

        // 4. Create DocumentTask entities
        var tasks = documentsToParse.Select(document => new DocumentTask
        {
            Id = Guid.NewGuid(),

            DocumentId = document.Id,

            Status = TaskStatus.Pending,

            CreatedBy = userId,

            CreatedAt = DateTime.UtcNow,
            TaskType = TaskType.Parse
        }).ToList();
        Console.WriteLine($"tasks: {tasks.Count} documents for parsing.");
        // 5. Update document status
        foreach (var document in documentsToParse)
        {
            // document.Status = DocumentStatus.Parsing;

            document.UpdatedAt = DateTime.UtcNow;
        }

        _documentRepository.UpdateRange(documentsToParse);

        // 6. Save tasks
        await _documentTaskRepository.AddRangeAsync(
        tasks,
        cancellationToken);

       
        var correlationId = Guid.NewGuid();
       
        foreach (var task in tasks)
        {
            var document = documentsToParse.FirstOrDefault(d => d.Id == task.DocumentId);
            var fileId = document.Files.FirstOrDefault().FileId;
            if (document == null)
            {
                Console.WriteLine($"No matching document found for Task.DocumentId: {task.DocumentId}");

                Console.WriteLine("Available document IDs:");
                foreach (var doc in documentsToParse)
                {
                    Console.WriteLine(doc.Id);
                }

                // Handle the missing document appropriately
                continue; // or return, or throw a more descriptive exception
            }

            var integrationEvent = new ParseDocumentRequestedEvent
            {
                MessageId = Guid.NewGuid(),
                CorrelationId = correlationId,
                TaskId = task.Id,
                DocumentId = task.DocumentId,
                TenantId = tenantId,
                UserId = userId,
                FileId = fileId,
                TaskType = task.TaskType
            };

            var outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                MessageId = integrationEvent.MessageId,
                CorrelationId = integrationEvent.CorrelationId,
                EventType = nameof(ParseDocumentRequestedEvent),
                Payload = JsonSerializer.Serialize(integrationEvent),
                Status = OutboxStatus.Pending,
                RetryCount = 0,
                CreatedOnUtc = DateTime.UtcNow
            };

            await _outboxRepository.AddAsync(outboxMessage, cancellationToken);
        }
        await _unitOfWork.CommitAsync(cancellationToken);
        // 9. Build response
        response.SuccessCount = tasks.Count;

        response.FailedCount = response.FailedDocuments.Count;

        response.SuccessfulDocumentIds = tasks
            .Select(x => x.DocumentId)
            .ToList();

        return response;
    }

    public async Task<DeleteDocumentsResponse> DeleteDocumentsAsync(
        DeleteDocumentsRequest request,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // 1. Load documents
        var documents = await _documentRepository.GetByIdsAsync(
            request.DocumentIds,
            tenantId,
            cancellationToken);

        var response = new DeleteDocumentsResponse();

        // 2. Validate existence
        var documentDictionary = documents.ToDictionary(x => x.Id);

        foreach (var documentId in request.DocumentIds)
        {
            if (!documentDictionary.ContainsKey(documentId))
            {
                response.FailedDocuments.Add(new DeleteDocumentFailure
                {
                    DocumentId = documentId,
                    Reason = "Document not found."
                });
            }
        }

        // 3. Validate documents
        var documentsToDelete = new List<Domain.Entities.Document>();

        foreach (var document in documents)
        {
            var hasActiveTask =
                await _documentTaskRepository.HasActiveParseTaskAsync(
                    document.Id,
                    cancellationToken);

            if (hasActiveTask)
            {
                response.FailedDocuments.Add(
                    new DeleteDocumentFailure
                    {
                        DocumentId = document.Id,
                        Reason = "Document is currently being parsed."
                    });

                continue;
            }

            if (!document.Files.Any())
            {
                response.FailedDocuments.Add(
                    new DeleteDocumentFailure
                    {
                        DocumentId = document.Id,
                        Reason = "No associated file found."
                    });

                continue;
            }

            documentsToDelete.Add(document);
        }
        if (documentsToDelete.Count == 0)
        {
            response.SuccessCount = documentsToDelete.Count;

            response.FailedCount = response.FailedDocuments.Count;

            response.SuccessfulDocumentIds = documentsToDelete
                .Select(x => x.Id)
                .ToList();
            return response;
        }
        // 4. Create Outbox Messages
        var correlationId = Guid.NewGuid();

        foreach (var document in documentsToDelete)
        {
            var integrationEvent = new DocumentDeletedEvent
            {
                MessageId = Guid.NewGuid(),
                CorrelationId = correlationId,
                DocumentId = document.Id,
                FileId = document.Files.First().FileId,
                TenantId = tenantId,
                UserId = userId
            };

            var outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                MessageId = integrationEvent.MessageId,
                CorrelationId = integrationEvent.CorrelationId,
                EventType = nameof(DocumentDeletedEvent),
                Payload = JsonSerializer.Serialize(integrationEvent),
                Status = OutboxStatus.Pending,
                RetryCount = 0,
                CreatedOnUtc = DateTime.UtcNow
            };

            await _outboxRepository.AddAsync(
                outboxMessage,
                cancellationToken);
        }

        // 5. Delete documents
        _documentRepository.DeleteRange(documentsToDelete);

        // 6. Commit once
        await _unitOfWork.CommitAsync(cancellationToken);

        // 7. Build response
        response.SuccessCount = documentsToDelete.Count;

        response.FailedCount = response.FailedDocuments.Count;

        response.SuccessfulDocumentIds = documentsToDelete
            .Select(x => x.Id)
            .ToList();

        return response;
    }
}