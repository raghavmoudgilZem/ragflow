package org.zemoso.listener;

import com.aventstack.extentreports.Status;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import org.zemoso.report.ExtentReportManager;
import org.zemoso.utils.ReportUtil;

public class ReportListener implements ITestListener {
    public String getTestName(ITestResult result) {
        return result.getTestName() != null ? result.getTestName()
                : result.getMethod().getConstructorOrMethod().getName();
    }

    public String getTestDescription(ITestResult result) {
        return result.getMethod().getDescription() != null ? result.getMethod().getDescription() : getTestName(result);
    }

    @Override
    public void onTestStart(ITestResult result) {
        System.out.print("in test on test start");
        ExtentReportManager.startTest(getTestName(result), getTestDescription(result));
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        ReportUtil.addScreenShot(Status.PASS, "Test Passed");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        Throwable t = result.getThrowable();

        String cause = "";
        if (t != null)
            cause = t.getMessage();
        ReportUtil.addScreenShot(Status.FAIL, "Test Failed : " + result.getThrowable().getStackTrace().toString());
    }

    @Override
    public void onTestSkipped(ITestResult result) {
    }

    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
    }

    @Override
    public void onStart(ITestContext context) {
    }

    @Override
    public void onFinish(ITestContext context) {
        ExtentReportManager.endCurrentTest();
        ExtentReportManager.getExtentReports().flush();
        ExtentReportManager.flushReports();
    }
}
