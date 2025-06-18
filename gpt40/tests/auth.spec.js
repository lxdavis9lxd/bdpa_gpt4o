// tests/auth.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('Registration, login, and logout flow', async ({ page }) => {
    const username = `testuser_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'TestPassword123!';

    // Register
    await page.goto('/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*explorer/);
    await expect(page.locator('.navbar-user')).toContainText(username);

    // Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL(/.*login/);

    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*explorer/);
    await expect(page.locator('.navbar-user')).toContainText(username);
  });
});
