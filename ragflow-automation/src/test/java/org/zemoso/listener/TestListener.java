package org.zemoso.listener;

import com.aventstack.extentreports.Status;
import lombok.extern.slf4j.Slf4j;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import org.zemoso.report.ExtentReportManager;
import org.zemoso.utils.LoggerUtil;
import org.zemoso.utils.ReportUtil;

import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
public class TestListener implements ITestListener {

    public String getTestName(ITestResult result) {
        return result.getTestName() != null ? result.getTestName()
                : result.getMethod().getConstructorOrMethod().getName();
    }

    /**
     * Gets the test description.
     *
     * @param result the result
     * @return the test description
     */
    public String getTestDescription(ITestResult result) {
        return result.getMethod().getDescription() != null ? result.getMethod().getDescription() : getTestName(result);
    }

    @Override
    public void onTestStart(ITestResult result) {
        LoggerUtil.info(getTestName(result) + ": Test started");
        ExtentReportManager.startTest(getTestName(result), getTestDescription(result));

    }

    @Override
    public void onTestSuccess(ITestResult result) {
        LoggerUtil.info(getTestName(result) + " : Test Passed");
        ReportUtil.addScreenShot(Status.PASS, "Test Passed");

    }

    @Override
    public void onTestFailure(ITestResult result) {
        Throwable t = result.getThrowable();
        String cause = "";
        if (t == null)
            return;
        cause = t.getMessage();
        String stackTrace = Arrays.stream(t.getStackTrace())
                .map(StackTraceElement::toString)
                .collect(Collectors.joining("<br>"));
        LoggerUtil.error(getTestName(result) + " : Test Failed : " + cause);
        ReportUtil.addScreenShot(Status.FAIL, "Test Failed : " + "Test Failed: <br><pre>" + stackTrace + "</pre>");

    }

    @Override
    public void onTestSkipped(ITestResult result) {
        LoggerUtil.info(getTestName(result) + " : Test Skipped");
    }

    @Override
    public void onFinish(ITestContext context) {
        ExtentReportManager.endCurrentTest();
        ExtentReportManager.getExtentReports().flush();
        ExtentReportManager.flushReports();
    }
}
