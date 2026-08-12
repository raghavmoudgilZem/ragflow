using System.Diagnostics;

namespace AutomationC_.Utils;

public static class LoggerUtil
{
    public static void Info(string message) => Trace.WriteLine($"INFO  [{DateTime.Now:O}] {message}");

    public static void Error(string message, Exception? exception = null) =>
        Trace.WriteLine($"ERROR [{DateTime.Now:O}] {message} {exception}");
}

