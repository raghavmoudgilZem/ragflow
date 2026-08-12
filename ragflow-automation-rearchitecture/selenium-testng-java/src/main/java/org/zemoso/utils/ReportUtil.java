package org.zemoso.utils;

import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.zemoso.base.WebDriverFactory;
import org.zemoso.report.ExtentReportManager;


public class ReportUtil {

    public static void addScreenShot(String message) {
        String base64Image = ((TakesScreenshot) WebDriverFactory.getDriver())
                .getScreenshotAs(OutputType.BASE64);

        ExtentReportManager.getCurrentTest().log(
                Status.INFO,
                message,
                MediaEntityBuilder.createScreenCaptureFromBase64String(base64Image).build()
        );
    }

    public static void addScreenShot(Status status, String message) {
        if (ExtentReportManager.getCurrentTest() == null)
            return;
        String base64Image = ((TakesScreenshot) WebDriverFactory.getDriver())
                .getScreenshotAs(OutputType.BASE64);

        ExtentReportManager.getCurrentTest().log(
                status,
                message,
                MediaEntityBuilder.createScreenCaptureFromBase64String(base64Image).build()
        );
    }

    public static void logMessage(String message, String details) {

        ExtentReportManager.getCurrentTest().log(
                Status.INFO,
                message + " - " + details
        );
    }

    public static void logMessage(Status status, String message, String details) {

        ExtentReportManager.getCurrentTest().log(
                status,
                message + " - " + details
        );
    }

}
