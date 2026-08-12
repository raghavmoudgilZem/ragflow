using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AutomationC_.Utils;

public static class SynchronizationUtils
{
    public static IWebElement WaitForElementVisible(WebDriverWait wait, By locator) =>
        wait.Until(driver =>
        {
            var element = driver.FindElement(locator);
            return element.Displayed ? element : null;
        });
}

