import { test as base, expect, Page } from '@playwright/test';
import { LoginPage, StudySelectionPage } from '../pageObjects';
import { config } from '../testData/test-config';

// Define the fixture type
type AuthFixtures = {
  authenticatedStudyPage: Page;
};

/**
 * Fixture that provides an authenticated page
 * This is reusable across test files to avoid repeating login steps
 */
export const test = base.extend<AuthFixtures>({
  authenticatedStudyPage: async ({ page }, use) => {
    // Initialize page objects
    const loginPage = new LoginPage(page);

    try {
      // Navigate to application
      await page.goto(config.baseUrl);
      
      // Login with configured credentials
      await loginPage.login(config.credentials.username, config.credentials.password);
      
      // Use the authenticated page
      await use(page);
      
      // Clean up - log out after test
      await loginPage.logout();
    } catch (error) {
      console.error('Auth fixture setup failed:', error);
      await page.screenshot({ path: `auth-fixture-failure-${Date.now()}.png` });
      throw error;
    }
  }
});

/**
 * Creates a fixture with a specific study selected
 * @param studyName - Name of the study to select
 * @returns A test fixture with the specified study selected
 */
export const createStudyFixture = (studyName: string) => {
  return base.extend<AuthFixtures>({
    authenticatedStudyPage: async ({ page }, use) => {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const studySelectionPage = new StudySelectionPage(page);

      try {
        // Navigate to application
        await page.goto(config.baseUrl);
        
        // Login with configured credentials
        await loginPage.login(config.credentials.username, config.credentials.password);
        
        // Select the specified study
        await studySelectionPage.selectStudy(studyName);
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Use the page with authentication and study selection
        await use(page);
        
        // Clean up - log out after test
        await loginPage.logout();
      } catch (error) {
        console.error(`Study fixture setup failed for study ${studyName}:`, error);
        await page.screenshot({ path: `study-fixture-failure-${Date.now()}.png` });
        throw error;
      }
    }
  });
};

export { expect };
