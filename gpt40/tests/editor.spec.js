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

  test('Open, edit, and save a file', async ({ page }) => {
    // Create a file first
    const filename = `editfile_${Date.now()}`;
    await page.fill('input[name="name"]', filename);
    await page.fill('textarea[name="text"]', 'Initial content');
    await page.click('button[type="submit"]:has-text("Create")');
    await expect(page.locator('td')).toContainText(filename);
    // Open in editor
    await page.click(`a:has-text('${filename}')`);
    await expect(page).toHaveURL(/.*editor/);
    // Edit content
    await page.fill('#editor-textarea', 'Updated content');
    await page.click('#save-btn');
    await expect(page.locator('.success')).toContainText('Saved');
    // Go back to explorer and check content
    await page.goto('/explorer');
    await expect(page.locator('td')).toContainText(filename);
  });
});
