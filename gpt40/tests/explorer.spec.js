// tests/explorer.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Explorer', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test account
    await page.goto('/login');
    await page.fill('input[name="username"]', process.env.TEST_USER || 'test');
    await page.fill('input[name="password"]', process.env.TEST_PASS || 'testpass');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*explorer/);
  });

  test('Create, rename, and delete a file', async ({ page }) => {
    const filename = `file_${Date.now()}`;
    // Create file
    await page.fill('input[name="name"]', filename);
    await page.fill('textarea[name="text"]', 'Hello world!');
    await page.click('button[type="submit"]:has-text("Create")');
    await expect(page.locator('td')).toContainText(filename);
    // Rename file
    await page.fill('input[placeholder="Rename"]', filename + '_renamed');
    await page.click('form[action="/explorer/rename"] button');
    await expect(page.locator('td')).toContainText(filename + '_renamed');
    // Delete file
    await page.click('form[action="/explorer/delete"] button');
    await page.on('dialog', dialog => dialog.accept());
    await expect(page.locator('td')).not.toContainText(filename + '_renamed');
  });
});
