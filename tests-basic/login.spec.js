const { test, expect } = require('@playwright/test');

test('login to Talosix EDC', async ({ page }) => {
  // Navigate to Talosix EDC
  await page.goto('https://staging.study.talosix.com');
  
  // Login
  await page.fill('input[type="email"]', 'talosix.qa+amxdo@gmail.com');
  await page.fill('input[type="password"]', 'T@losix91');
  await page.click('button:has-text("Sign In")');
  
  // Verify we are on the study selection page
  await expect(page).toHaveURL(/select-study/);
});