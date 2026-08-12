// using Microsoft.AspNetCore.Identity;

using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using Ragflow.Identity.Application.Events;
using Ragflow.Identity.Application.Interfaces;
using Ragflow.Identity.Domain.Common.Constants;
using Ragflow.Identity.Domain.Entities;
using MassTransit;

namespace Ragflow.Identity.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUserTenantRepository _userTenantRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IOutboxRepository _outboxRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRefreshTokenStore _refreshTokenStore;
    
    public AuthService(
        IPublishEndpoint publishEndpoint,
        ITenantRepository tenantRepository,
        IUserRepository userRepository,
        IUserTenantRepository userTenantRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IRefreshTokenStore refreshTokenStore,
        IRefreshTokenRepository refreshTokenRepository, IOutboxRepository outboxRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _userTenantRepository = userTenantRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _refreshTokenStore = refreshTokenStore;

        _tenantRepository = tenantRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _outboxRepository = outboxRepository;
        _unitOfWork = unitOfWork;
        _publishEndpoint = publishEndpoint;
    }


    public async Task<ApiResponse<LoginUserDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        //---------------------------------
        // Validate Request
        //---------------------------------

        if (request == null)
            throw new UnauthorizedAccessException(
                "Unauthorized.");

        //---------------------------------
        // Block Default Admin
        //---------------------------------

        if (request.Email.Equals(
            "admin@ragflow.io",
            StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException(
                "Default admin account cannot login.");
        }

        //---------------------------------
        // Find User
        //---------------------------------

        var user =
            await _userRepository.GetByEmailAsync(
                request.Email,
                cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        //---------------------------------
        // Check Password
        //---------------------------------

        var valid =
            await _userRepository.CheckPasswordAsync(
                user.Id,
                request.Password);

        if (!valid)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        //---------------------------------
        // Check User Status
        //---------------------------------

        if (user.Status != UserStatus.Active)
        {
            throw new UnauthorizedAccessException(
                "Account disabled.");
        }

        //---------------------------------
        // Get Tenant Memberships
        //---------------------------------
        Console.WriteLine($"User {user.Email} has Id {user.Id}");
        var memberships =
            await _userTenantRepository
                .GetDefaultMembershipAsync(
                    user.Id,

                    cancellationToken);

        // if (!memberships.Any())
        if (memberships == null)
        {
            throw new UnauthorizedAccessException(
                "User is not assigned to any tenant.");
        }

        //---------------------------------
        // Pick Tenant
        //---------------------------------

        // var membership = memberships.First();
        var membership = memberships;
        //---------------------------------
        // Get User Roles
        //---------------------------------

        var roles =
            await _userRepository.GetRolesAsync(user.Id);

        var role =
            roles.FirstOrDefault() ?? "User";

        //---------------------------------
        // Update Last Login
        //---------------------------------

        await _userRepository
            .UpdateLastLoginAsync(
                user.Id,
                DateTime.UtcNow,
                cancellationToken);

        //---------------------------------
        // Session Id
        //---------------------------------

        var sessionId =
            Guid.NewGuid().ToString();

        //---------------------------------
        // JWT
        //---------------------------------

        var accessToken =
            _jwtTokenGenerator
            .GenerateAccessToken(
                user.Id,
                user.Email!,
                membership.TenantId,
                role,
                user.Status.ToString()
                );

        //---------------------------------
        // Refresh Token
        //---------------------------------

        var refreshToken =
            _jwtTokenGenerator
            .GenerateRefreshToken();
        var tokenHash =
            RefreshTokenHasher.Hash(
                refreshToken);

        var refreshExpiry =
            request.RememberMe
            ? TimeSpan.FromDays(30)
            : TimeSpan.FromDays(1);
        await _refreshTokenRepository.AddAsync(
            new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.Add(refreshExpiry),
                CreatedAt = DateTime.UtcNow


            },
            cancellationToken
        ); await _refreshTokenStore.SaveAsync(
                    refreshToken,
                    user.Id,
                    refreshExpiry);

        //---------------------------------
        // Response
        //---------------------------------

        return new ApiResponse<LoginUserDto>
        {
            Success = true,

            Data = new LoginUserDto
            {
                Id = user.Id,
                Email = user.Email!,
                Name = user.username,
                Roles = roles.ToList(),
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = 3600
            },


        };
    }
    public async Task<ApiResponse<LoginResponseDto>> RefreshTokenAsync(
        RefreshTokenRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId =
    await _refreshTokenStore
        .GetUserIdAsync(
            request.RefreshToken);
        var hash =
                   RefreshTokenHasher.Hash(
                       request.RefreshToken);
        if (userId == null)
        {



            var token =
                await _refreshTokenRepository
                    .GetByTokenHashAsync(
                        hash,
                        cancellationToken);
            if (token == null)
            {

                return new ApiResponse<LoginResponseDto>
                {
                    Success = false,
                    Errors = new List<string> { "Invalid refresh token." }
                };
            }

        }


        var user =
            await _userRepository.GetByIdAsync(
                userId.Value,
                cancellationToken);

        if (user is null)
        {

            return new ApiResponse<LoginResponseDto>
            {
                Success = false,
                Errors = new List<string> { "User not found." }
            };
        }


        var membership =
            await _userTenantRepository
                .GetDefaultMembershipAsync(
                    user.Id,

                    cancellationToken);

        if (membership == null)
        {

            return new ApiResponse<LoginResponseDto>
            {
                Success = false,
                Errors = new List<string> { "Tenant membership not found." }
            };
        }

        // New JWT
        var newAccessToken =
       _jwtTokenGenerator.GenerateAccessToken(
    user.Id,
    user.Email!,
    membership.TenantId,
    membership.Role.ToString(),
    user.Status.ToString());

        // New Refresh Token
        var newRefreshToken =
            _jwtTokenGenerator.GenerateRefreshToken();


        await _refreshTokenStore.DeleteAsync(
            request.RefreshToken);

        await _refreshTokenStore.SaveAsync(
            newRefreshToken,
            user.Id,
            TimeSpan.FromDays(30));
        var newtokenHash =
            RefreshTokenHasher.Hash(
                newRefreshToken);
        await _refreshTokenRepository.RevokeAsync(
hash,
cancellationToken);
        var refreshExpiry =

                 TimeSpan.FromDays(1);
        await _refreshTokenRepository.AddAsync(
            new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = newtokenHash,
                ExpiresAt = DateTime.UtcNow.Add(refreshExpiry),
                CreatedAt = DateTime.UtcNow


            },
            cancellationToken
        );
     

        return new ApiResponse<LoginResponseDto>
        {
            Success = true,
            Data = new LoginResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15)
            }

        };
    }



    public async Task<RegisterResponseDto> RegisterAsync(
        RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        // Validate email

        if (!Regex.IsMatch(
            request.Email,
            @"^[\w\._-]+@([\w_-]+\.)+[\w-]{2,}$"))
        {
            throw new Exception(
                $"Invalid email address: {request.Email}");
        }

        // Check existing user

        var existingUser =
            await _userRepository.GetByEmailAsync(
                request.Email,
                cancellationToken);

        if (existingUser != null)
        {
            throw new Exception(
                $"Email: {request.Email} has already registered!");
        }

        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Create Identity user

        await _userRepository.CreateAsync(
            new CreateUserRequest
            {
                Id = userId,
                Email = request.Email,
                Password = request.Password,
                NickName = request.Nickname
            },
            cancellationToken);

        // Default role

        await _userRepository.AddToRoleAsync(
            userId,
            TenantRole.Owner.ToString(),
            cancellationToken);

        // Create default tenant

        await _tenantRepository.AddAsync(
            new Tenant
            {
                Id = tenantId,
                Name = request.Nickname + "'s Kingdom"
            },
            cancellationToken);

        // User tenant mapping

        await _userTenantRepository.AddAsync(
            new UserTenant
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TenantId = tenantId,
                InvitedBy = userId,
                Role = TenantRole.Owner.ToString()
            },
            cancellationToken);

        var messageId = Guid.NewGuid();

        var correlationId = Guid.NewGuid();

        var integrationEvent =
            new UserRegisteredEvent
            {
                MessageId = messageId,
                CorrelationId = correlationId,
                UserId = userId,
                Email = request.Email,
                UserName = request.Nickname
            };

        var outboxMessage = new OutboxMessage
        {
            Id = Guid.NewGuid(),

            MessageId = messageId,

            CorrelationId = correlationId,

            EventType = nameof(UserRegisteredEvent),

            Payload = JsonSerializer.Serialize(
         integrationEvent),

            Status = OutboxStatus.Pending,

            RetryCount = 0,

            CreatedOnUtc = DateTime.UtcNow
        };

        // await _outboxRepository.AddAsync(
        //     outboxMessage,
        //     cancellationToken);

        await _unitOfWork.SaveChangesAsync(
        cancellationToken);
        try
        {
            await _publishEndpoint.Publish(
                integrationEvent,
                cancellationToken);

            // outboxMessage.Status =
            //     OutboxStatus.Processed;

            // outboxMessage.ProcessedOnUtc =
            //     DateTime.UtcNow;

            // await _unitOfWork.SaveChangesAsync(
            //     cancellationToken);
        }
        catch (Exception ex)
        {
            await _outboxRepository.AddAsync(
            outboxMessage,
            cancellationToken);
            outboxMessage.RetryCount++;

            outboxMessage.ErrorMessage =
                ex.Message;

            outboxMessage.LastAttemptOnUtc =
                DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
        return new RegisterResponseDto
        {
            UserId = userId,
            Email = request.Email,
            Nickname = request.Nickname,
            Message = $"{request.Nickname}, welcome aboard!"
        };
    }

    public async Task<ApiResponse<LogoutResponseDto>> LogoutAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        await _refreshTokenStore.DeleteAsync(
            refreshToken);
        var hash =
                   RefreshTokenHasher.Hash(
                       refreshToken);
        await _refreshTokenRepository.RevokeAsync(
hash,
cancellationToken);


        return new ApiResponse<LogoutResponseDto>
        {
            Success = true,
            Data = new LogoutResponseDto
            {
                Message = "Logged out successfully."
            }
        };

    }
}

public sealed class CreateUserRequest
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string NickName { get; set; } = string.Empty;


}
public sealed class LogoutResponseDto
{


    public string Message { get; set; } = string.Empty;




}