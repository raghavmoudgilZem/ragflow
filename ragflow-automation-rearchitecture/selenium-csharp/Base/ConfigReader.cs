using AutomationC_.Utils;

namespace AutomationC_.Base;

public static class ConfigReader
{
    private static readonly Dictionary<string, string> Properties = LoadProperties();

    public static string GetProperty(string key) =>
        Properties.TryGetValue(key, out var value)
            ? value
            : throw new KeyNotFoundException($"Key '{key}' not found in application.properties");

    public static bool GetBooleanProperty(string key) =>
        bool.TryParse(GetProperty(key), out var result) && result;

    private static Dictionary<string, string> LoadProperties()
    {
        var properties = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        var baseDirectory = AppContext.BaseDirectory;
        var configPath = Path.Combine(baseDirectory, ConstantUtils.PathToConfig.Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (!File.Exists(configPath))
        {
            throw new FileNotFoundException(ConstantUtils.LogFailedToLoadProps, configPath);
        }

        foreach (var line in File.ReadAllLines(configPath))
        {
            var trimmed = line.Trim();

            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#"))
            {
                continue;
            }

            var separatorIndex = trimmed.IndexOf('=', StringComparison.Ordinal);
            if (separatorIndex <= 0)
            {
                continue;
            }

            var key = trimmed[..separatorIndex].Trim();
            var value = trimmed[(separatorIndex + 1)..].Trim();

            if (!string.IsNullOrEmpty(key))
            {
                properties[key] = value;
            }
        }

        return properties;
    }
}

