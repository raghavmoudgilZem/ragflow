package org.zemoso.base;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.zemoso.utils.LoggerUtil;

import java.time.Duration;

import static org.zemoso.utils.ConstantUtils.*;

@Slf4j
public class WebDriverFactory {

    private static final ThreadLocal<WebDriverWait> synchronize;
    @Getter
    private static WebDriver driver;

    static {
        synchronize = new ThreadLocal<>();
    }

    private WebDriverFactory() {
    }

    public static WebDriverWait getWait() {
        return synchronize.get();
    }

    public static WebDriver getDriver(String browser) {
        if (driver == null) {
            switch (browser){
                case "chrome":
                    ChromeOptions chromeOptions = new ChromeOptions();
                    if (ConfigReader.getBooleanProperty("HEADLESS")) {
                        LoggerUtil.info("App is running in headless");
                        chromeOptions.addArguments("--headless=new");
                    }

                    // Incognito
                    if (ConfigReader.getBooleanProperty("INCOGNITO")) {
                        chromeOptions.addArguments("--incognito");
                    }

                    chromeOptions.addArguments("--disable-notifications");
                    chromeOptions.addArguments("--disable-gpu");
                    chromeOptions.addArguments("--start-maximized");

                    driver = new ChromeDriver(chromeOptions);
                    break;
                case "firefox":
                    System.setProperty("webdriver.gecko.driver", ConfigReader.getProperty("FIREFOX_DRIVER_PATH"));

                    FirefoxOptions firefoxOptions = new FirefoxOptions();

                    // Headless
                    if (ConfigReader.getBooleanProperty("HEADLESS")) {
                        log.info("in head less");
                        firefoxOptions.addArguments("--headless");
                    }

                    // Private browsing (incognito)
                    if (ConfigReader.getBooleanProperty("INCOGNITO")) {
                        firefoxOptions.addArguments("-private");
                    }

                    driver = new FirefoxDriver(firefoxOptions);
                    break;
                default:
                    throw new RuntimeException("Unsupported browser: " + browser);
            }

            long implicitWait = Long.parseLong(ConfigReader.getProperty("IMPLICIT_WAIT_IN_SEC"));
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(implicitWait));

        }

        return driver;
    }

    public static void closeBrowser() {
        if (driver != null) {
            driver.quit();
        }
    }
}
