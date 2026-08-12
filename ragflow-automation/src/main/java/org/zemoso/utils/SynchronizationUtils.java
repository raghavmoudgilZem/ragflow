package org.zemoso.utils;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.zemoso.base.WebDriverFactory;

import java.time.Duration;


public class SynchronizationUtils {

    public static void waitForVisibility(By by, WebDriverWait wait) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
    }

    public static void waitForVisibility(WebElement element, WebDriverWait wait) {
        wait.until(ExpectedConditions.visibilityOf(element));
    }

    public static void waitUntilClickable(By by, WebDriverWait wait) {
        wait.until(ExpectedConditions.elementToBeClickable(by));
    }

    public static void waitUntilClickable(WebElement element, WebDriverWait wait) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
    }

    public WebElement fluentWait(By locator, Integer timeOut, Integer pollingTime) {
        Wait<WebDriver> fluentWait = new FluentWait<>(WebDriverFactory.getDriver())
                .withTimeout(Duration.ofSeconds(timeOut))
                .pollingEvery(Duration.ofSeconds(pollingTime))
                .ignoring(NoSuchElementException.class);

        return fluentWait.until(driver -> driver.findElement(locator));
    }
}
