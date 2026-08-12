package org.zemoso.report;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class ExtentReportManager {

    // Thread-safe map for parallel execution
    private static final Map<Long, ExtentTest> extentTestMap = new HashMap<>();
    private static ExtentReports extentReports;
    private static ExtentSparkReporter sparkReporter;

    private ExtentReportManager() {
        // Prevent instantiation
    }

    public static synchronized ExtentReports getExtentReports() {

        if (extentReports == null) {
            String reportPath = "reports" + File.separator + "ExtentReport.html";

            sparkReporter = new ExtentSparkReporter(reportPath);

            sparkReporter.config().setDocumentTitle("Automation Report");
            sparkReporter.config().setReportName("Test Execution Report");

            extentReports = new ExtentReports();
            extentReports.attachReporter(sparkReporter);

            extentReports.setSystemInfo("Project", "Ragflow selenium automation");
            extentReports.setSystemInfo("Environment", "QA");
            extentReports.setSystemInfo("Executed By", System.getProperty("user.name"));
        }

        return extentReports;
    }

    public static synchronized void startTest(String testName, String description) {

        ExtentTest test = getExtentReports().createTest(testName, description);

        extentTestMap.put(Thread.currentThread().getId(), test);
    }

    public static synchronized ExtentTest getCurrentTest() {

        return extentTestMap.get(Thread.currentThread().getId());
    }

    public static synchronized void endCurrentTest() {

        extentTestMap.remove(Thread.currentThread().getId());
    }

    public static synchronized void flushReports() {
        if (extentReports != null) {
            extentReports.flush();
        }
    }
}