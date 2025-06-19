// tests/ui.spec.js
// Playwright UI test for BDPADrive using the provided test account

const { test, expect } = require('@playwright/test');
const { TEST_USER } = require('../playwright.env');

test.describe('BDPADrive UI', () => {
  test('Login, navigate Explorer, Dashboard, Editor', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);

    // Login
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/explorer/);
    await expect(page.locator('nav')).toContainText('Explorer');
    await expect(page.locator('nav')).toContainText('Dashboard');
    await expect(page.locator('nav')).toContainText('Editor');

    // Go to Dashboard
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Go to Explorer
    await page.click('a[href="/explorer"]');
    await expect(page).toHaveURL(/explorer/);
    await expect(page.locator('h1')).toContainText('Explorer');

    // Go to Editor (should load, but may need a valid file id in a real app)
    await page.click('a[href="/editor"]');
    // Editor page may require a file id, so just check navigation works
    await expect(page.url()).toContain('/editor');
  });
});
