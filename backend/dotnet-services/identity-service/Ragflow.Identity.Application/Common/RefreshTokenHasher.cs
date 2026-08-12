using System.Security.Cryptography;
using System.Text;

public static class RefreshTokenHasher
{
    public static string Hash(string token)
    {
        using var sha256 = SHA256.Create();

        var bytes = sha256.ComputeHash(
            Encoding.UTF8.GetBytes(token));

        return Convert.ToHexString(bytes);
    }
}