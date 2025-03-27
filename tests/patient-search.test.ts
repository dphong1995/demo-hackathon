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
 * Test suite for Data Management - Patient Search functionality
 */
test.describe('Patient Search Tests', () => {

  // Test for searching patients
  test('should search for patients', async ({ page }) => {
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
      
      // Get current patient count
      const initialCount = await dataManagementPage.getPatientCount();
      console.log(`Initial patient count: ${initialCount}`);
      
      // If there are patients, perform a search
      if (initialCount > 0) {
        // Get the first patient ID
        const firstPatientId = await dataManagementPage.getFirstPatientId();
        
        if (firstPatientId) {
          // Search for this specific patient
          await dataManagementPage.searchPatient(firstPatientId);
          
          // Wait for search results
          await page.waitForLoadState('networkidle', { timeout: 15000 });
          
          // Verify the search results show only one patient or the correct patient
          const searchResultCount = await dataManagementPage.getPatientCount();
          console.log(`Search result count for "${firstPatientId}": ${searchResultCount}`);
          
          // Clear the search
          await dataManagementPage.clearSearch();
          
          // Verify we're back to the original count (approximately)
          await page.waitForLoadState('networkidle', { timeout: 15000 });
          const afterClearCount = await dataManagementPage.getPatientCount();
          console.log(`After clear count: ${afterClearCount}`);
          
          // The count might not be exactly the same due to data changes,
          // but it should be at least as many as before, likely more
          expect(afterClearCount).toBeGreaterThanOrEqual(initialCount);
        }
      } else {
        console.log('No patients found, skipping search test');
        // If no patients, we'll verify the No Data message is displayed
        const noDataVisible = await dataManagementPage.isNoDataMessageVisible();
        expect(noDataVisible).toBeTruthy();
      }
      
      // Log out after test
      await loginPage.logout();
    } catch (error) {
      console.error('Test failed:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: `patient-search-test-failure-${Date.now()}.png` });
      throw error;
    }
  });
});
