using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ragflow.Identity.Application.DTOs;
using Ragflow.Identity.Application.Interfaces;
using Ragflow.Identity.Application.Services;

// using Ragflow.Identity.Application.Models;
using Ragflow.Identity.Infrastructure.Identity;

namespace Ragflow.Identity.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _dbcontext;

    public UserRepository(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _dbcontext = context;
    }

    public async Task<UserLoginInfo?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken)
    {
        var user =
            await _userManager
                .Users
                .FirstOrDefaultAsync(
                    x => x.Email == email,
                    cancellationToken);

        if (user == null)
            return null;

        return new UserLoginInfo
        {
            Id = user.Id,
            Email = user.Email!,
            Status = user.Status,
            username = user.NormalizedUserName
        };
    }

    public async Task<UserLoginInfo?> GetByIdAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user =
            await _userManager.Users
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
            return null;

        return new UserLoginInfo
        {
            Id = user.Id,
            Email = user.Email!,
            Status = user.Status,
            username = user.UserName

        };
    }

    public async Task<bool> CheckPasswordAsync(
        Guid userId,
        string password)
    {
        var user =
            await _userManager.FindByIdAsync(
                userId.ToString());

        if (user == null)
            return false;

        return await _userManager
            .CheckPasswordAsync(
                user,
                password);
    }

    public async Task UpdateLastLoginAsync(
        Guid userId,
        DateTime loginTime,
        CancellationToken cancellationToken)
    {
        var user =
            await _userManager.FindByIdAsync(
                userId.ToString());

        if (user == null)
            return;

        user.LastLoginAt = loginTime;

        await _userManager.UpdateAsync(user);
    }
    public async Task CreateAsync(
    CreateUserRequest request,
    CancellationToken cancellationToken)
    {
        var user =
            new ApplicationUser
            {
                Id = request.Id,
                UserName = request.NickName,
                Email = request.Email,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = null,

                Status = UserStatus.Active,


            };

        var result =
            await _userManager.CreateAsync(
                user,
                request.Password);

        if (!result.Succeeded)
        {
            throw new Exception(
                string.Join(",",
                    result.Errors.Select(x => x.Description)));
        }
    }
    public async Task AddToRoleAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken)
    {
        var user =
            await _userManager.FindByIdAsync(
                userId.ToString());

        if (user == null)
        {
            throw new Exception(
                "User not found.");
        }

        await _userManager.AddToRoleAsync(
            user,
            role);
    }
    public async Task<List<string>> GetRolesAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(
            userId.ToString());

        if (user == null)
        {
            return new List<string>();
        }

        var roles = await _userManager.GetRolesAsync(user);

        return roles.ToList();
    }
    public async Task<ApiResponse<PagedUserResponseDto>> GetUsersAsync(
        GetUsersRequestDto request,
        CancellationToken cancellationToken)
    {
        var query =
            _dbcontext.Users.AsQueryable();

        //---------------------------------
        // Search
        //---------------------------------

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();

            query = query.Where(x =>
                x.Email!.ToLower().Contains(search) ||
                x.UserName.ToLower().Contains(search)
                );
        }

        //---------------------------------
        // Status
        //---------------------------------

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            query = query.Where(x =>
                x.Status.ToString() == request.Status);
        }

        //---------------------------------
        // Tenant Filter
        //---------------------------------

        if (request.TenantId.HasValue)
        {
            var userIds =
                _dbcontext.UserTenants
                    .Where(x =>
                        x.TenantId == request.TenantId.Value)
                    .Select(x => x.UserId);

            query = query.Where(x =>
                userIds.Contains(x.Id));
        }

        //---------------------------------
        // Sorting
        //---------------------------------

        query =
            (request.SortBy?.ToLower(),
             request.SortOrder?.ToLower()) switch
            {
                ("email", "desc") =>
                    query.OrderByDescending(x => x.Email),

                ("createdat", "desc") =>
                    query.OrderByDescending(x => x.CreatedAt),

                ("lastlogin", "desc") =>
                    query.OrderByDescending(x => x.LastLoginAt),

                ("name", "desc") =>
                    query.OrderByDescending(x => x.UserName),

                ("email", _) =>
                    query.OrderBy(x => x.Email),

                ("createdat", _) =>
                    query.OrderBy(x => x.CreatedAt),

                ("lastlogin", _) =>
                    query.OrderBy(x => x.LastLoginAt),

                _ =>
                    query.OrderBy(x => x.UserName)
            };

        //---------------------------------
        // Count
        //---------------------------------

        var totalRecords =
            await query.CountAsync(
                cancellationToken);

        //---------------------------------
        // Paging
        //---------------------------------

        var users =
            await query
                .Skip(
                    (request.Page - 1)
                    * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new UserListItemDto
                {
                    Id = x.Id,

                    Name =
                        x.UserName,
                    Email = x.Email!,

                    Status = x.Status.ToString(),

                    // CreatedAt = x.CreatedAt,

                    TenantCount =
                        _dbcontext.UserTenants
                            .Count(t =>
                                t.UserId == x.Id)
                })
                .ToListAsync(
                    cancellationToken);

        var data = new PagedUserResponseDto
        {
            Items = users,

            Pagination = new PaginationDto
            {
                Page = request.Page,

                PageSize = request.PageSize,

                TotalRecords = totalRecords,

                TotalPages =
                    (int)Math.Ceiling(
                        totalRecords /
                        (double)request.PageSize)
            }
        };
        return new ApiResponse<PagedUserResponseDto>
        {
            Success = true,
            Data = data

        };
    }
    public async Task<ApiResponse<UserDetailsDto?>> GetUserDetailsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user =
            await _dbcontext.Users
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
            return new ApiResponse<UserDetailsDto?>
            {
                Success = false,
                Errors = new List<string> { "User not found" },
                Data = null
            };

        var roles =
            await _userManager.GetRolesAsync(user);

        return new ApiResponse<UserDetailsDto?>
        {
            Success = true,
            Data = new UserDetailsDto
            {
                Id = user.Id,
                Email = user.Email!,
                Name = user.UserName!,
                Status = user.Status.ToString(),

                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Roles = roles.ToList()
            }
        };
    }

    public async Task<ApiResponse<UserEnableDisableDto?>> DisableUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user =
            await _dbcontext.Users
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
            return new ApiResponse<UserEnableDisableDto?>
            {
                Success = false,
                Errors = new List<string> { "User not found" },
                Data = null
            };

        user.Status = UserStatus.Inactive;

        await _dbcontext.SaveChangesAsync(
            cancellationToken);
        return new ApiResponse<UserEnableDisableDto?>
        {
            Success = true,

            Data = new UserEnableDisableDto
            {
                UserId = userId,
                Status = user.Status.ToString()
            },


        };

    }
    public async Task<ApiResponse<UserEnableDisableDto?>> EnableUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user =
            await _dbcontext.Users
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
            return new ApiResponse<UserEnableDisableDto?>
            {
                Success = false,
                Errors = new List<string> { "User not found" },
                Data = null
            };

        user.Status = UserStatus.Active;

        await _dbcontext.SaveChangesAsync(
            cancellationToken);

        return new ApiResponse<UserEnableDisableDto?>
        {
            Success = true,

            Data = new UserEnableDisableDto
            {
                UserId = userId,
                Status = user.Status.ToString()
            },


        };
    }
    public async Task<ApiResponse<List<UserTenantDto>>>
        GetUserTenantsAsync(
            Guid userId,
            CancellationToken cancellationToken)
    {
        var user =
           await _dbcontext.Users
               .FirstOrDefaultAsync(
                   x => x.Id == userId,
                   cancellationToken);

        if (user == null)
            return new ApiResponse<List<UserTenantDto>>
            {
                Success = false,
                Errors = new List<string> { "User not found" },
                Data = null
            };
        var data = await _dbcontext.UserTenants
.Where(x => x.UserId == userId)
.Select(x => new UserTenantDto
{
    TenantId = x.TenantId,
    TenantName = x.Tenant.Name,
    Role = x.Role,
    Status = x.Status,
    AcceptedAt = x.AcceptedAt
})
.ToListAsync(cancellationToken);

        return new ApiResponse<List<UserTenantDto>>
        {
            Success = true,
            Data = data

        };
    }





    public Task<int> GetUsersCountAsync(string? search, string? status, Guid? tenantId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }


}