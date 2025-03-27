import { test, expect } from './fixture/auth-fixture';

test.describe('Authenticated user tests', () => {
  // Use the auth fixture from auth-fixture.ts
  test('should be able to view studies list', async ({ authenticatedStudyPage: page }) => {
    // Navigate to study selection page
    await page.goto('/select-study');
    
    // Test user can see studies heading
    await expect(page.locator('text=Studies')).toBeVisible();

    // Verify study table is visible
    const studyTable = page.locator('table');
    await expect(studyTable).toBeVisible();

    // Check for some expected column headers
    await expect(page.locator('text=Name')).toBeVisible();
    await expect(page.locator('text=Date created')).toBeVisible();
  });
});
