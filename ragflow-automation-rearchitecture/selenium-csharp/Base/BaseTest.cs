using AutomationC_.Utils;
using NUnit.Framework;
using NUnit.Framework.Interfaces;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AutomationC_.Base;

public abstract class BaseTest
{
    protected IWebDriver Driver => WebDriverFactory.Driver;
    protected WebDriverWait Wait => WebDriverFactory.Wait;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        Listeners.TestListener.OnRunStart();
    }

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        Listeners.TestListener.OnRunFinish();
    }

    [SetUp]
    public void SetUp()
    {
        var browser = "chrome";
        if (ConfigReader.GetBooleanProperty("BROWSER"))
        {
            browser = ConfigReader.GetProperty("BROWSER");
        }

        WebDriverFactory.GetDriver(browser);

        Listeners.TestListener.OnTestStart(TestContext.CurrentContext.Test.Name);

        Driver.Navigate().GoToUrl(ConfigReader.GetProperty("BASE_URL"));

        var width = int.Parse(ConfigReader.GetProperty(ConstantUtils.Width));
        var height = int.Parse(ConfigReader.GetProperty(ConstantUtils.Height));
        Driver.Manage().Window.Size = new System.Drawing.Size(width, height);
    }

    [TearDown]
    public void TearDown()
    {
        Listeners.TestListener.OnTestFinish(TestContext.CurrentContext);

        WebDriverFactory.CloseBrowser();
    }
}

