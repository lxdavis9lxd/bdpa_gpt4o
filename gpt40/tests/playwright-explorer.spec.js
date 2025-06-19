// playwright-explorer.spec.js
// Playwright script to test all Explorer functions for BDPADrive

const { test, expect } = require('@playwright/test');

const USER = {
  username: 'testuser6913',
  password: 'TestPassword123!'
};

test('Explorer full workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="username"]', USER.username);
  await page.fill('input[name="password"]', USER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/explorer/);

  // Create a folder
  await page.selectOption('select[name="type"]', 'directory');
  await page.fill('input[name="name"]', 'TestFolder');
  await page.click('button[type="submit"]:has-text("Create")');
  await expect(page.locator('td')).toContainText('TestFolder');

  // Create a file
  await page.selectOption('select[name="type"]', 'file');
  await page.fill('input[name="name"]', 'TestFile.txt');
  await page.fill('textarea[name="text"]', 'Hello world!');
  await page.click('button[type="submit"]:has-text("Create")');
  await expect(page.locator('td')).toContainText('TestFile.txt');

  // Tag the file
  const fileRow = page.locator('tr', { hasText: 'TestFile.txt' });
  await fileRow.locator('input[name="tags"]').fill('testtag');
  await fileRow.locator('button[type="submit"]:has-text("Update Tags")').click();
  // No error expected

  // Rename the file
  await fileRow.locator('input[name="new_name"]').fill('TestFileRenamed.txt');
  await fileRow.locator('button[type="submit"]:has-text("Rename")').click();
  await expect(page.locator('td')).toContainText('TestFileRenamed.txt');

  // Move the file to the folder
  const folderRow = page.locator('tr', { hasText: 'TestFolder' });
  const folderId = await folderRow.locator('input[name="node_id"]').inputValue();
  await fileRow.locator('input[name="target_folder"]').fill(folderId);
  await fileRow.locator('button[type="submit"]:has-text("Move")').click();
  // Navigate into folder
  await page.click(`a[href*="parent=${folderId}"]`);
  await expect(page.locator('td')).toContainText('TestFileRenamed.txt');

  // Create a symlink to the file
  await page.selectOption('select[name="type"]', 'symlink');
  await page.fill('input[name="name"]', 'TestSymlink');
  await page.fill('input[name="target_id"]', folderId); // Symlink to folder for demo
  await page.click('button[type="submit"]:has-text("Create")');
  await expect(page.locator('td')).toContainText('TestSymlink');

  // Change owner (will fail if not permitted, but test the form)
  const symlinkRow = page.locator('tr', { hasText: 'TestSymlink' });
  await symlinkRow.locator('input[name="new_owner"]').fill(USER.username);
  await symlinkRow.locator('button[type="submit"]:has-text("Change Owner")').click();

  // Delete symlink, file, and folder (cleanup)
  await symlinkRow.locator('button[type="submit"]:has-text("Delete")').click();
  await fileRow.locator('button[type="submit"]:has-text("Delete")').click();
  await folderRow.locator('button[type="submit"]:has-text("Delete")').click();
});
