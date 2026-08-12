using AutomationC_.Utils;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Support.UI;

namespace AutomationC_.Base;

public static class WebDriverFactory
{
    private static readonly ThreadLocal<IWebDriver?> DriverHolder = new();
    private static readonly ThreadLocal<WebDriverWait?> WaitHolder = new();

    public static IWebDriver Driver => DriverHolder.Value ?? throw new InvalidOperationException("WebDriver has not been initialized.");

    public static WebDriverWait Wait => WaitHolder.Value ?? throw new InvalidOperationException("WebDriverWait has not been initialized.");

    public static IWebDriver GetDriver(string browser)
    {
        if (DriverHolder.Value != null)
        {
            return DriverHolder.Value;
        }

        IWebDriver driver = browser.ToLowerInvariant() switch
        {
            "chrome" => CreateChromeDriver(),
            "firefox" => CreateFirefoxDriver(),
            _ => throw new ArgumentOutOfRangeException(nameof(browser), browser, "Unsupported browser")
        };

        var implicitWaitInSec = TimeSpan.FromSeconds(
            double.Parse(ConfigReader.GetProperty("IMPLICIT_WAIT_IN_SEC"))
        );
        driver.Manage().Timeouts().ImplicitWait = implicitWaitInSec;

        DriverHolder.Value = driver;
        WaitHolder.Value = new WebDriverWait(driver, implicitWaitInSec);

        return driver;
    }

    public static void CloseBrowser()
    {
        if (DriverHolder.Value is null)
        {
            return;
        }

        try
        {
            DriverHolder.Value.Quit();
        }
        finally
        {
            DriverHolder.Value.Dispose();
            DriverHolder.Value = null;
            WaitHolder.Value = null;
        }
    }

    private static IWebDriver CreateChromeDriver()
    {
        var options = new ChromeOptions();

        if (ConfigReader.GetBooleanProperty("HEADLESS"))
        {
            options.AddArgument("--headless=new");
        }

        if (ConfigReader.GetBooleanProperty("INCOGNITO"))
        {
            options.AddArgument("--incognito");
        }

        options.AddArgument("--disable-notifications");
        options.AddArgument("--disable-gpu");
        options.AddArgument("--start-maximized");

        return new ChromeDriver(options);
    }

    private static IWebDriver CreateFirefoxDriver()
    {
        var options = new FirefoxOptions();

        if (ConfigReader.GetBooleanProperty("HEADLESS"))
        {
            options.AddArgument("--headless");
        }

        if (ConfigReader.GetBooleanProperty("INCOGNITO"))
        {
            options.AddArgument("-private");
        }

        var driverPath = ConfigReader.GetProperty("FIREFOX_DRIVER_PATH");
        if (!string.IsNullOrWhiteSpace(driverPath))
        {
            Environment.SetEnvironmentVariable("webdriver.gecko.driver", driverPath);
        }

        return new FirefoxDriver(options);
    }
}

