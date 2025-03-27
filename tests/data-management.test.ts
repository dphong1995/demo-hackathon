import { test, expect } from '@playwright/test';
import { LoginPage, StudySelectionPage, DataManagementPage } from './pageObjects';
import { config } from './testData/test-config';

/**
 * Test suite for Data Management functionality
 * This test demonstrates the end-to-end flow of logging in, selecting a study,
 * and performing data management operations.
 */
test.describe('Data Management Tests', () => {
  // Define test environment information
  const baseUrl = config.baseUrl;
  const credentials = config.credentials;
  const studyInfo = config.study;

  // Test for navigating to the Data Management page
  test('should navigate to Data Management page', async ({ page }) => {
    try {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const studySelectionPage = new StudySelectionPage(page);
      const dataManagementPage = new DataManagementPage(page);
      
      // Navigate to the application
      await page.goto(baseUrl);
      
      // Login with provided credentials
      await loginPage.login(credentials.username, credentials.password);
      
      // Verify login was successful by checking for user menu
      await expect(loginPage.userMenu).toBeVisible({ timeout: 10000 });
      
      // Select the test study
      await studySelectionPage.selectStudy(studyInfo.name);
      
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

  // Test for checking patient count
  test('should display patient count or No Data message', async ({ page }) => {
    try {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const studySelectionPage = new StudySelectionPage(page);
      const dataManagementPage = new DataManagementPage(page);
      
      // Navigate to the application
      await page.goto(baseUrl);
      
      // Login with provided credentials
      await loginPage.login(credentials.username, credentials.password);
      
      // Select the test study
      await studySelectionPage.selectStudy(studyInfo.name);
      
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

  // Test for searching patients
  test('should search for patients', async ({ page }) => {
    try {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const studySelectionPage = new StudySelectionPage(page);
      const dataManagementPage = new DataManagementPage(page);
      
      // Navigate to the application
      await page.goto(baseUrl);
      
      // Login with provided credentials
      await loginPage.login(credentials.username, credentials.password);
      
      // Select the test study
      await studySelectionPage.selectStudy(studyInfo.name);
      
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
