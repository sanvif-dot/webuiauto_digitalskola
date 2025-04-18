const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('SauceDemo Functional Tests', function () {
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.quit();
    });

    it('should login successfully', async function () {
        await driver.get('https://www.saucedemo.com');

        // Enter username and password
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');

        // Click login button
        await driver.findElement(By.id('login-button')).click();

        // Validate successful login by checking presence of inventory page
        const inventoryHeader = await driver.wait(
            until.elementLocated(By.className('title')),
            5000
        );
        const headerText = await inventoryHeader.getText();
        assert.strictEqual(headerText, 'Products');
    });

    it('should sort products A-Z', async function () {
        // Select the sorting dropdown and choose "A-Z"
        const sortDropdown = await driver.findElement(By.className('product_sort_container'));
        await sortDropdown.click();
        await sortDropdown.findElement(By.css('option[value="az"]')).click();

        // Validate sorting
        const productNames = await driver.findElements(By.className('inventory_item_name'));
        const names = await Promise.all(productNames.map(async (element) => await element.getText()));
        const sortedNames = [...names].sort(); // Sort names alphabetically

        assert.deepStrictEqual(names, sortedNames, 'Products are not sorted alphabetically A-Z');
    });
});