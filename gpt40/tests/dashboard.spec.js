// tests/dashboard.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test account
    await page.goto('/login');
    await page.fill('input[name="username"]', process.env.TEST_USER || 'test');
    await page.fill('input[name="password"]', process.env.TEST_PASS || 'testpass');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*explorer/);
    await page.goto('/dashboard');
  });

  test('View user info and storage usage', async ({ page }) => {
    await expect(page.locator('body')).toContainText('Username:');
    await expect(page.locator('body')).toContainText('Email:');
    await expect(page.locator('body')).toContainText('Storage Used:');
  });
});
