const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Google Search Test', function () {
    let driver;

    it('Visit SauceDemo dan cek page title', async function () {
        driver = await new Builder().forBrowser('chrome').build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();

        await driver.quit();
    });
});