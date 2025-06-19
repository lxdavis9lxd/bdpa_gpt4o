// playwright-login.spec.js
// Playwright script to test login functionality for BDPADrive

const { test, expect } = require('@playwright/test');

test('Login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Login/);

  await page.fill('input[name="username"]', 'testuser6913');
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');

  // Expect to be redirected to Explorer or dashboard after login
  await expect(page).toHaveURL(/explorer|dashboard/);

  // Check for Dashboard and Logoff in the navbar
  await expect(page.locator('nav')).toContainText('Dashboard');
  await expect(page.locator('nav')).toContainText('Logoff');

  // Check for Explorer page heading
  if ((await page.url()).includes('explorer')) {
    await expect(page.locator('h1')).toContainText('Explorer');
  }
});
