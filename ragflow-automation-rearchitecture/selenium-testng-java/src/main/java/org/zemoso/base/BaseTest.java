package org.zemoso.base;


import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.zemoso.utils.ConstantUtils;

import java.time.Duration;

import static org.zemoso.utils.ConstantUtils.*;

public class BaseTest {
    protected static WebDriver driver;

    @BeforeSuite
    public void setUp() {
        // Initialize driver based on browser from config
        String browser = "chrome";
        if(ConfigReader.getBooleanProperty("BROWSER"))
            browser = ConfigReader.getProperty("BROWSER");
        driver = WebDriverFactory.getDriver(browser);

        // Set implicit wait from config
        long implicitWait = Long.parseLong(ConfigReader.getProperty(IMPLICIT_WAIT_IN_SEC));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(implicitWait));

        // Open base URL from config
        driver.get(ConfigReader.getProperty(BASE_URL));

        // window size
        int width = Integer.parseInt(ConfigReader.getProperty(ConstantUtils.WIDTH));
        int height = Integer.parseInt(ConfigReader.getProperty(ConstantUtils.HEIGHT));
        Dimension screenSize = new Dimension(width, height);
        driver.manage().window().setSize(screenSize);
    }

    @AfterSuite
    public void tearDown() {
        WebDriverFactory.closeBrowser();
    }
}
