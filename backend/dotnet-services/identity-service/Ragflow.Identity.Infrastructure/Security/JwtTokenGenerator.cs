using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Ragflow.Identity.Infrastructure.Security;

public sealed class JwtTokenGenerator
    : IJwtTokenGenerator
{
    private readonly JwtOptions _jwtOptions;

    public JwtTokenGenerator(
        IOptions<JwtOptions> options)
    {
        _jwtOptions = options.Value;
    }
public string GenerateAccessToken(
    Guid userId,
    string email,
    Guid tenantId,
    string role,
    string status
)
{
  var claims = new List<Claim>
{
    new Claim(
        JwtRegisteredClaimNames.Sub,
        userId.ToString()),

    new Claim(
        JwtRegisteredClaimNames.Email,
        email),

    new Claim(
        "tenantId",
        tenantId.ToString()),

    new Claim(
        ClaimTypes.Role,
        role),

    new Claim(
        "status",
        status),



    new Claim(
        "fresh",
        "true")
};

    // Existing JWT code...

Console.WriteLine($"JWT Secret = [{_jwtOptions.Secret}]");

        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _jwtOptions.Secret));

        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        var token =
            new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(64));
    }
}