package org.zemoso.utils;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

public class HelperUtils {

    private HelperUtils() {
    }

    public static void sleepForAWhile(int timer) {
        try {
            Thread.sleep(timer);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
    public static void clearAndType(WebElement element, String text) {
        element.click();
        element.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        element.sendKeys(Keys.DELETE);
        element.sendKeys(text);
    }

}
