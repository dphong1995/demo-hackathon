import { LoginPage, StudySelectionPage, DataManagementPage } from '../pageObjects';
import { config } from '../testData/test-config';
import { Page } from '@playwright/test';

/**
 * Helper functions for common Talosix EDC operations
 * These functions encapsulate common workflows that span multiple pages
 */
export class TalosixHelper {
  /**
   * Login to the application and select a study
   * @param page - Playwright page object
   * @param studyName - Name of the study to select (defaults to config value)
   */
  static async loginAndSelectStudy(
    page: Page, 
    studyName: string = config.study.name
  ): Promise<void> {
    // Initialize page objects
    const loginPage = new LoginPage(page);
    const studySelectionPage = new StudySelectionPage(page);
    
    try {
      // Navigate to the application
      await page.goto(config.baseUrl);
      
      // Login with configured credentials
      await loginPage.login(config.credentials.username, config.credentials.password);
      
      // Select the specified study
      await studySelectionPage.selectStudy(studyName);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle', { timeout: config.timeouts.navigation });
    } catch (error) {
      console.error('Login and study selection failed:', error);
      await page.screenshot({ path: `login-study-selection-failure-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Navigate to Data Management page and verify it loaded
   * @param page - Playwright page object
   */
  static async navigateToDataManagement(page: Page): Promise<DataManagementPage> {
    const dataManagementPage = new DataManagementPage(page);
    
    try {
      // Navigate to Data Management page
      await dataManagementPage.navigateToDataManagement();
      
      // Wait for the Add Patient button to be visible to confirm page loaded
      await page.waitForSelector(
        'button:has-text("Add patient")', 
        { state: 'visible', timeout: config.timeouts.element }
      );
      
      return dataManagementPage;
    } catch (error) {
      console.error('Navigation to Data Management failed:', error);
      await page.screenshot({ path: `data-management-nav-helper-failure-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Clean up by logging out
   * @param page - Playwright page object
   */
  static async logout(page: Page): Promise<void> {
    const loginPage = new LoginPage(page);
    
    try {
      await loginPage.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Don't throw error for logout failures
    }
  }
  
  /**
   * Generate a random email for testing
   * @returns A random email address
   */
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `test.user+${timestamp}${random}@example.com`;
  }
}
