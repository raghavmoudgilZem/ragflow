using AventStack.ExtentReports;
using AventStack.ExtentReports.Reporter;

namespace AutomationC_.Reporting;

public static class ExtentReportManager
{
    private static readonly object LockObj = new();
    private static ExtentReports? _extent;
    private static readonly AsyncLocal<ExtentTest?> CurrentTestHolder = new();

    public static ExtentTest? CurrentTest => CurrentTestHolder.Value;

    public static void InitReport()
    {
        if (_extent != null)
        {
            return;
        }

        lock (LockObj)
        {
            if (_extent != null)
            {
                return;
            }

            var reportsDir = Path.Combine(AppContext.BaseDirectory, "Reports");
            Directory.CreateDirectory(reportsDir);

            // Always use a single report file per project and overwrite if it exists
            var reportPath = Path.Combine(reportsDir, "ExtentReport.html");
            if (File.Exists(reportPath))
            {
                File.Delete(reportPath);
            }

            var spark = new ExtentSparkReporter(reportPath);
            _extent = new ExtentReports();
            _extent.AttachReporter(spark);
        }
    }

    public static void Flush()
    {
        lock (LockObj)
        {
            _extent?.Flush();
        }
    }

    public static void CreateTest(string testName)
    {
        InitReport();
        CurrentTestHolder.Value = _extent!.CreateTest(testName);
    }

    public static void LogPass(string message) => CurrentTestHolder.Value?.Pass(message);

    public static void LogFail(string message) => CurrentTestHolder.Value?.Fail(message);
}

