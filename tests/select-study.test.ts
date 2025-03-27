import { createStudyFixture } from "./fixture/auth-fixture";

// Create a test instance with the custom study fixture
const test = createStudyFixture('3 Xuan Testing');
const { expect } = test;

test.describe('Tests with custom study selection', () => {
  test('should work with a different study', async ({ authenticatedStudyPage: page }) => {
    // Verify we're on the specified study home page
    await expect(page.locator('button:has-text("3 Xuan Testing")')).toBeVisible();

    // Test any specific functionality for this study
    // For example, check that the study title is displayed correctly
    await expect(page.locator('button:has-text("Study:")')).toBeVisible();
  });
});
