const { test, expect } = require('@playwright/test');

test.describe('Navbar visual regression', () => {
  test('Navbar matches baseline', async ({ page }) => {
    await page.goto(process.env.URL || 'http://localhost:3000');
    await page.waitForSelector('#main-navbar');

    const nav = page.locator('#main-navbar');
    // take a full nav screenshot and compare
    await expect(nav).toHaveScreenshot('navbar.png', { animations: 'disabled' });
  });
});