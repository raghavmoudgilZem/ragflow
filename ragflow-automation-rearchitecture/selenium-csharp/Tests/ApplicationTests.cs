using AutomationC_.Base;
using AutomationC_.Pages;
using NUnit.Framework;

namespace AutomationC_.Tests;

[TestFixture]
[Category("smoke")]
public class ApplicationTests : BaseTest
{
    [Test]
    [Category("ui")]
    public void HomePage_ShouldHaveTitle()
    {
        var page = new ApplicationPage(Driver);
        Assert.That(Driver.Title, Is.Not.Null);
    }
}

