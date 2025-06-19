// tests/editor.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test account
    await page.goto('/login');
    await page.fill('input[name="username"]', process.env.TEST_USER || 'test');
    await page.fill('input[name="password"]', process.env.TEST_PASS || 'testpass');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*explorer/);
  });
});
