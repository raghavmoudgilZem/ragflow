package org.zemoso.utils;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.zemoso.base.ConfigReader;
import org.zemoso.base.WebDriverFactory;

import java.time.Duration;
import java.util.function.Function;

import static org.zemoso.utils.ConstantUtils.IMPLICIT_WAIT_IN_SEC;


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
    public static WebDriverWait getWait(WebDriver driver) {
        long waitTime = Long.parseLong(ConfigReader.getProperty(IMPLICIT_WAIT_IN_SEC));
        return getWait(driver,waitTime);
    }

    public static WebDriverWait getWait(WebDriver driver, long seconds) {
        return new WebDriverWait(driver, Duration.ofSeconds(seconds));
    }

    public static <T, R> R waitUntil(T input, Duration timeout, Duration polling, Function<T, R> condition) {
        return new FluentWait<>(input)
                .withTimeout(timeout)
                .pollingEvery(polling)
                .ignoring(Exception.class)
                .until(condition);
    }

    public static void waitForInvisibility(By by, WebDriverWait wait) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(by));
    }

}
