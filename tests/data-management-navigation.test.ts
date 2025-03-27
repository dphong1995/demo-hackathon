import { test, expect } from '@playwright/test';
import { LoginPage, StudySelectionPage, DataManagementPage } from './pageObjects';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for test environment
 */
const config = {
  baseUrl: process.env.DOMAIN || 'https://staging.study.talosix.com',
  credentials: {
    username: process.env.USERNAME || 'talosix.qa+amxdo@gmail.com',
    password: process.env.PASSWORD || 'T@losix91'
  },
  study: {
    name: '3 Xuan Testing',
    siteName: 'Site 1' // Assuming this site exists in the test study
  }
};

/**
 * Test suite for Data Management functionality
 * This test demonstrates the end-to-end flow of logging in, selecting a study,
 * and performing data management operations.
 */
test.describe('Data Management Tests', () => {
  
  // Test for navigating to the Data Management page
  test('should navigate to Data Management page', async ({ page }) => {
    try {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const studySelectionPage = new StudySelectionPage(page);
      const dataManagementPage = new DataManagementPage(page);
      
      // Navigate to the application
      await page.goto(config.baseUrl);
      
      // Login with provided credentials
      await loginPage.login(config.credentials.username, config.credentials.password);
      
      // Verify login was successful by checking for user menu
      await expect(loginPage.userMenu).toBeVisible({ timeout: 10000 });
      
      // Select the test study
      await studySelectionPage.selectStudy(config.study.name);
      
      // Wait for study to load
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Navigate to Data Management page
      await dataManagementPage.navigateToDataManagement();
      
      // Verify we're on the Data Management page by checking for the Add Patient button
      await expect(dataManagementPage.addPatientButton).toBeVisible({ timeout: 10000 });
      
      // Log out after test
      await loginPage.logout();
    } catch (error) {
      console.error('Test failed:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: `data-management-test-failure-${Date.now()}.png` });
      throw error;
    }
  });
});
