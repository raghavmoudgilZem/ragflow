using Ragflow.Identity.Application.DTOs;

public sealed class PagedUserResponseDto
{
    public List<UserListItemDto> Items { get; set; } = [];

    public PaginationDto Pagination { get; set; } = new();
}