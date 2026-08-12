using Document.API.Exceptions;
using Document.Application.DTOs.Common;
using Document.Application.DTOs.Requests;
using Document.Application.DTOs.Responses;
using Document.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Document.API.Controllers;

[ApiController]
// [Authorize]
[Route("api/v1/documents")]
public sealed class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(CreateDocumentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create(
        [FromForm] CreateDocumentApiRequest request,
        CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();

        var userId = GetUserId();
        var applicationRequest = new CreateDocumentRequest
        {
            KnowledgeBaseId = request.KnowledgeBaseId,
            Name = request.Name,
            Description = request.Description,
            ParserId = request.ParserId,
            ParseImmediately = request.ParseImmediately,
            File = new FileUploadRequest
            {
                FileName = request.File.FileName,
                ContentType = request.File.ContentType,
                Length = request.File.Length,
                Content = request.File.OpenReadStream()
            }
        };
        var response = await _documentService.CreateDocumentAsync(
            applicationRequest,
            tenantId,
            userId,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { documentId = response.DocumentId },
            response);
    }

    

    private Guid GetTenantId()
    {
        var value = HttpContext.Request.Headers["X-Tenant-Id"].FirstOrDefault();

        if (!Guid.TryParse(value, out var tenantId))
        {
            throw new UnauthorizedAccessException("Tenant Id is missing.");
        }

        return tenantId;
    }

    private Guid GetUserId()
    {
        var value = HttpContext.Request.Headers["X-User-Id"].FirstOrDefault();

        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException("User Id is missing.");
        }

        return userId;
    }
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<GetDocumentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocuments(
    [FromQuery] GetDocumentsRequest request,
    CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();

        var response = await _documentService.GetDocumentsAsync(
            request,
            tenantId,
            cancellationToken);

        return Ok(response);
    }





    [HttpGet("{documentId:guid}")]
    [ProducesResponseType(
        typeof(GetDocumentByIdResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(
        Guid documentId,
        CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();

        var response = await _documentService.GetDocumentByIdAsync(
            documentId,
            tenantId,
            cancellationToken);

        return Ok(response);
    }



    [HttpPut("{documentId:guid}")]
    [ProducesResponseType(
        typeof(UpdateDocumentResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(
        Guid documentId,
        [FromForm] UpdateDocumentRequest request,
        CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();

        var userId = GetUserId();

        var response = await _documentService.UpdateDocumentAsync(
            documentId,
            request,
            tenantId,
            userId,
            cancellationToken);

        return Ok(response);
    }
    [HttpPost("parse")]
    public async Task<IActionResult> ParseDocuments(
        [FromBody] ParseDocumentsRequest request,
        CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        var userId = GetUserId();
        Console.WriteLine($"Controller Count: {request.DocumentIds.Count}");

        foreach (var id in request.DocumentIds)
        {
            Console.WriteLine($"Controller Id: {id}");
        }
        var response = await _documentService.ParseDocumentsAsync(
            request,
            tenantId,
            userId,
            cancellationToken);

        return Accepted(response);
    }

    [HttpPost("delete")]
    [ProducesResponseType(typeof(DeleteDocumentsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteDocuments(
         [FromBody] DeleteDocumentsRequest request,
         CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();

        var userId = GetUserId();

        var response = await _documentService.DeleteDocumentsAsync(
            request,
            tenantId,
            userId,
            cancellationToken);

        return Ok(response);
    }

}