import { Builder, By, until } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';

async function captureScreenshot() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log('Navigating to SauceDemo login page...');
        await driver.get('https://www.saucedemo.com');

        // Set browser window size for consistent screenshots
        await driver.manage().window().setRect({ width: 1280, height: 1024 });

        // Log in to SauceDemo
        await driver.findElement(By.css('[data-test="username"]')).sendKeys('standard_user');
        await driver.findElement(By.css('[data-test="password"]')).sendKeys('secret_sauce');
        const loginButton = await driver.findElement(By.css('.submit-button.btn_action'));
        await loginButton.click();

        // Wait for the inventory page to load
        console.log('Waiting for the inventory page to load...');
        await driver.wait(until.elementLocated(By.className('inventory_list')), 5000);

        // Capture the screenshot
        console.log('Capturing inventory page screenshot...');
        const screenshotBuffer = await driver.takeScreenshot();

        // Ensure the baseline directory exists
        const baselineDir = './baseline/';
        if (!fs.existsSync(baselineDir)) {
            fs.mkdirSync(baselineDir, { recursive: true });
        }

        // Save the screenshot
        const screenshotPath = path.join(baselineDir, 'inventory.png');
        fs.writeFileSync(screenshotPath, screenshotBuffer, 'base64');
        console.log(`Screenshot saved at: ${screenshotPath}`);
    } catch (error) {
        console.error('Error capturing screenshot:', error);
    } finally {
        await driver.quit();
        console.log('Browser closed.');
    }
}

captureScreenshot().catch((error) => {
    console.error('Unexpected error:', error);
});