package org.zemoso.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;


public class ApplicationPage extends BasePage {

    private final Actions actions;

    public ApplicationPage(WebDriver driver) {
        super(driver);                  // driver set in BasePage
        this.actions = new Actions(driver);
        PageFactory.initElements(driver, this);

    }

}
