const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('SauceDemo Functional Tests (Firefox)', function () {
    let driver;

    before(async function () {
        // Initialize Firefox browser before the entire test suite starts
        console.log('Test suite setup: Initializing Firefox WebDriver...');
        driver = await new Builder().forBrowser('firefox').build();
    });

    after(async function () {
        // Close Firefox after the entire test suite ends
        console.log('Test suite cleanup: Closing Firefox WebDriver...');
        await driver.quit();
    });

    beforeEach(async function () {
        // Navigate to SauceDemo homepage and log in
        console.log('Preparing test case: Navigating to SauceDemo homepage...');
        await driver.get('https://www.saucedemo.com');
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        await driver.findElement(By.id('login-button')).click();
        await driver.wait(until.elementLocated(By.className('inventory_list')), 10000);
    });

    afterEach(async function () {
        // Log out after each test case
        console.log('Cleaning up after test case: Logging out...');
        const menuButton = await driver.findElement(By.id('react-burger-menu-btn'));
        await menuButton.click();
        const logoutLink = await driver.wait(
            until.elementLocated(By.id('logout_sidebar_link')),
            5000
        );
        await logoutLink.click();
    });

    it('should login successfully', async function () {
        console.log('Executing test: Validating successful login...');
        const inventoryHeader = await driver.wait(
            until.elementLocated(By.className('title')),
            5000
        );
        const headerText = await inventoryHeader.getText();
        assert.strictEqual(headerText, 'Products');
    });

    it('should sort products A-Z', async function () {
        console.log('Executing test: Validating product sorting...');
        const sortDropdown = await driver.wait(
            until.elementLocated(By.className('product_sort_container')),
            5000
        );
        await sortDropdown.click();
        await sortDropdown.findElement(By.css('option[value="az"]')).click();

        const productNames = await driver.findElements(By.className('inventory_item_name'));
        const names = await Promise.all(productNames.map(async (element) => await element.getText()));
        const sortedNames = [...names].sort();
        assert.deepStrictEqual(names, sortedNames, 'Products are not sorted alphabetically A-Z');
    });

    it('should verify page titles on navigation', async function () {
        console.log('Executing test: Validating page titles...');
        // Check title on inventory page
        const inventoryTitle = await driver.getTitle();
        assert.strictEqual(inventoryTitle, 'Swag Labs', 'Inventory page title mismatch');

        // Navigate to cart page and validate title
        await driver.findElement(By.className('shopping_cart_link')).click();
        const cartTitle = await driver.getTitle();
        assert.strictEqual(cartTitle, 'Swag Labs', 'Cart page title mismatch');
    });

    it('should verify item details on product page', async function () {
        console.log('Executing test: Validating item details on product page...');
        // Select first item on inventory page
        const firstItem = await driver.findElement(By.className('inventory_item_name'));
        const itemName = await firstItem.getText();
        await firstItem.click();

        // Validate product details
        const productTitle = await driver.wait(until.elementLocated(By.className('inventory_details_name')), 5000);
        const productTitleText = await productTitle.getText();
        assert.strictEqual(productTitleText, itemName, 'Product name mismatch on details page');
    });

    it('should add items to cart', async function () {
        console.log('Executing test: Adding items to cart...');
        // Add first item to cart
        const addToCartButton = await driver.findElement(By.className('btn_inventory'));
        await addToCartButton.click();

        // Verify cart count
        const cartBadge = await driver.wait(until.elementLocated(By.className('shopping_cart_badge')), 5000);
        const cartCount = await cartBadge.getText();
        assert.strictEqual(cartCount, '1', 'Cart count mismatch after adding item');
    });
});