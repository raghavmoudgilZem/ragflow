using AutomationC_.Reporting;
using NUnit.Framework;
using NUnit.Framework.Interfaces;

namespace AutomationC_.Listeners;

public static class TestListener
{
    public static void OnRunStart()
    {
        ExtentReportManager.InitReport();
    }

    public static void OnRunFinish()
    {
        ExtentReportManager.Flush();
    }

    public static void OnTestStart(string testName)
    {
        ExtentReportManager.CreateTest(testName);
    }

    public static void OnTestFinish(TestContext context)
    {
        var result = context.Result;

        switch (result.Outcome.Status)
        {
            case TestStatus.Passed:
                ExtentReportManager.LogPass("Test passed");
                break;
            case TestStatus.Failed:
                ExtentReportManager.LogFail($"Test failed: {result.Message}");
                break;
            default:
                // Do not log extra info-only entries
                break;
        }
    }
}

