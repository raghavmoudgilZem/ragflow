package org.zemoso.tests;

import lombok.extern.slf4j.Slf4j;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import org.zemoso.base.BaseTest;
import org.zemoso.pages.ApplicationPage;
import org.zemoso.utils.LoggerUtil;


@Slf4j
public class ApplicationTest extends BaseTest {

    private ApplicationPage applicationPage;

    @BeforeTest
    public void initPages() {
        applicationPage = new ApplicationPage(driver);
    }

}




