import { test, expect } from '@playwright/test';
import { LoginPage, StudySelectionPage, DataManagementPage } from './pageObjects';

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
 * Test suite for Data Management - Patient Count functionality
 */
test.describe('Patient Count Tests', () => {

  // Test for checking patient count
  test('should display patient count or No Data message', async ({ page }) => {
    try {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const studySelectionPage = new StudySelectionPage(page);
      const dataManagementPage = new DataManagementPage(page);
      
      // Navigate to the application
      await page.goto(config.baseUrl);
      
      // Login with provided credentials
      await loginPage.login(config.credentials.username, config.credentials.password);
      
      // Select the test study
      await studySelectionPage.selectStudy(config.study.name);
      
      // Navigate to Data Management page
      await dataManagementPage.navigateToDataManagement();
      
      // Get the patient count
      const patientCount = await dataManagementPage.getPatientCount();
      console.log(`Current patient count: ${patientCount}`);
      
      // If patient count is zero, verify No Data message is displayed
      if (patientCount === 0) {
        // Verify either the No Data message or image is visible
        const noDataVisible = await dataManagementPage.isNoDataMessageVisible();
        expect(noDataVisible).toBeTruthy();
      } else {
        // Verify patient table is visible
        const tableVisible = await dataManagementPage.isPatientTableVisible();
        expect(tableVisible).toBeTruthy();
      }
      
      // Log out after test
      await loginPage.logout();
    } catch (error) {
      console.error('Test failed:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: `patient-count-test-failure-${Date.now()}.png` });
      throw error;
    }
  });
});
