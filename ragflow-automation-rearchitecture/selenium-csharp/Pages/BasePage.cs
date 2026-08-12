using AutomationC_.Base;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AutomationC_.Pages;

public abstract class BasePage
{
    protected IWebDriver Driver { get; }
    protected WebDriverWait Wait { get; }

    protected BasePage(IWebDriver driver)
    {
        Driver = driver;
        Wait = WebDriverFactory.Wait;
    }
}

