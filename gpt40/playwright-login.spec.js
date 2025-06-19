// playwright-login.spec.js
// Playwright script to test login functionality for BDPADrive

const { test, expect } = require('@playwright/test');

test('Login with valid credentials', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page).toHaveTitle(/Login/);

  await page.fill('input[name="username"]', 'testuser6913');
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');

  // Expect to be redirected to Explorer or dashboard after login
  await expect(page).toHaveURL(/explorer|dashboard/);
  await expect(page.locator('nav')).toContainText('Explorer');
  await expect(page.locator('nav')).toContainText('Dashboard');
});
