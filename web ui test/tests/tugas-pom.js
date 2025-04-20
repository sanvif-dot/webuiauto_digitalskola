import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import page_login from '../pages/page_login.js';

let driver;

function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

describe('SauceDemo - POM and Visual Regression (Firefox)', function () {
    this.timeout(30000);

    beforeEach(async function () {
        driver = await new Builder().forBrowser('firefox').build();
    });

    afterEach(async function () {
        await driver.quit();
    });

    it('Login and check elements using POM', async function () {
        await driver.get('https://www.saucedemo.com');

        const title = await driver.getTitle();
        assert.strictEqual(title, 'Swag Labs');

        const inputUsername = await driver.findElement(page_login.inputUsername);
        const inputPassword = await driver.findElement(page_login.inputPassword);
        const buttonLogin = await driver.findElement(page_login.buttonLogin);

        await inputUsername.sendKeys('standard_user');
        await inputPassword.sendKeys('secret_sauce');
        await buttonLogin.click();

        const cartButton = await driver.wait(
            until.elementLocated(By.css('[data-test="shopping-cart-link"]')),
            5000
        );
        await driver.wait(until.elementIsVisible(cartButton), 3000);

        const appLogo = await driver.findElement(By.className('app_logo'));
        const logoText = await appLogo.getText();
        assert.strictEqual(logoText, 'Swag Labs');

        await driver.sleep(1000);
    });

    it('Cek Visual halaman checkout', async function () {
        await driver.get('https://www.saucedemo.com');

        const inputUsername = await driver.findElement(page_login.inputUsername);
        const inputPassword = await driver.findElement(page_login.inputPassword);
        const buttonLogin = await driver.findElement(page_login.buttonLogin);

        await inputUsername.sendKeys('standard_user');
        await inputPassword.sendKeys('secret_sauce');
        await buttonLogin.click();

        const addToCartButton = await driver.findElement(By.css('[data-test="add-to-cart-sauce-labs-backpack"]'));
        await addToCartButton.click();

        const cartButton = await driver.findElement(By.css('[data-test="shopping-cart-link"]'));
        await cartButton.click();

        const checkoutButton = await driver.findElement(By.css('[data-test="checkout"]'));
        await checkoutButton.click();

        await driver.wait(until.elementLocated(By.css('[data-test="firstName"]')), 5000);

        ensureDirExists('screenshots');

        const screenshot = await driver.takeScreenshot();
        const imgBuffer = Buffer.from(screenshot, 'base64');
        fs.writeFileSync('screenshots/current_checkout.png', imgBuffer);

        const baselinePath = 'screenshots/baseline_checkout.png';
        const currentPath = 'screenshots/current_checkout.png';
        const diffPath = 'screenshots/diff_checkout.png';

        if (!fs.existsSync(baselinePath)) {
            fs.copyFileSync(currentPath, baselinePath);
            console.log('🟡 Baseline checkout image saved.');
        }

        const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
        const img2 = PNG.sync.read(fs.readFileSync(currentPath));
        const { width, height } = img1;
        const diff = new PNG({ width, height });

        const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
        fs.writeFileSync(diffPath, PNG.sync.write(diff));

        if (numDiffPixels > 0) {
            console.log(`⚠️ Visual differences found on checkout page! Pixels different: ${numDiffPixels}`);
        } else {
            console.log('✅ No visual differences found on checkout page.');
        }
    });
});
