using KnowledgeBase.Application.DTOs.Dataset;
using KnowledgeBase.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeBase.API.Controllers;

[ApiController]
[Route("api/v1/knowledgebases")]

public class KnowledgeBaseController : ControllerBase
{
    private readonly IKnowledgeBaseService _knowledgeBaseService;

    public KnowledgeBaseController(IKnowledgeBaseService knowledgeBaseService)
    {
        _knowledgeBaseService = knowledgeBaseService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateDatasetRequest request,
        CancellationToken cancellationToken)
    {

        var userId = new Guid(Request.Headers["X-User-Id"].ToString());

        var tenantId = new Guid(Request.Headers["X-Tenant-Id"].ToString());

        var response = await _knowledgeBaseService.CreateDatasetAsync(
            request,
            tenantId,
            userId,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            response);
    }


    [HttpGet]
    public async Task<IActionResult> GetDatasets(
    [FromQuery] GetDatasetsRequest request,
    CancellationToken cancellationToken)
    {

        var tenantId = new Guid(Request.Headers["X-Tenant-Id"].ToString());
        var result = await _knowledgeBaseService.GetDatasetsAsync(
            request, tenantId,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var tenantId = new Guid(Request.Headers["X-Tenant-Id"].ToString());
        var result = await _knowledgeBaseService.GetDatasetByIdAsync(
            id, tenantId,
            cancellationToken);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]

    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateDatasetRequest request,
        CancellationToken cancellationToken)
    {
        var userId = new Guid(Request.Headers["X-User-Id"].ToString());

        var tenantId = new Guid(Request.Headers["X-Tenant-Id"].ToString());
        var result = await _knowledgeBaseService.UpdateDatasetAsync(
            id,
            tenantId,
            userId,
            request,
            cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]

    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var tenantId = new Guid(Request.Headers["X-Tenant-Id"].ToString());
        await _knowledgeBaseService.DeleteDatasetAsync(
            id, tenantId,
            cancellationToken);

        return NoContent();
    }
}