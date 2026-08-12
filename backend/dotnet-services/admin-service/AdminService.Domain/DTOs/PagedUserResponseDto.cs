namespace Ragflow.AdminService.Domain.DTOs;

public sealed class PagedUserResponseDto
{
    public List<UserListItemDto> Items { get; set; } = [];

    public PaginationDto Pagination { get; set; } = new();
}
