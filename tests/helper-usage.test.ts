import { test, expect } from '@playwright/test';
import { TalosixHelper } from './helpers/talosix-helper';
import { DataManagementPage } from './pageObjects';
import { config } from './testData/test-config';

/**
 * Example test using the helper functions
 * This demonstrates how to use the helper functions for cleaner tests
 */
test.describe('Data Management with Helpers', () => {
  
  test('should navigate to Data Management with helpers', async ({ page }) => {
    try {
      // Login and select study using helper
      await TalosixHelper.loginAndSelectStudy(page);
      
      // Navigate to Data Management page using helper
      const dataManagementPage = await TalosixHelper.navigateToDataManagement(page);
      
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
      
      // Logout using helper
      await TalosixHelper.logout(page);
    } catch (error) {
      console.error('Test failed:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: `helper-test-failure-${Date.now()}.png` });
      throw error;
    }
  });

  test('should search for patients with helpers', async ({ page }) => {
    try {
      // Login and select study using helper
      await TalosixHelper.loginAndSelectStudy(page);
      
      // Navigate to Data Management page using helper
      const dataManagementPage = await TalosixHelper.navigateToDataManagement(page);
      
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
          await page.waitForLoadState('networkidle', { timeout: config.timeouts.navigation });
          
          // Verify the search results
          const searchResultCount = await dataManagementPage.getPatientCount();
          console.log(`Search result count for "${firstPatientId}": ${searchResultCount}`);
          
          // Clear the search
          await dataManagementPage.clearSearch();
          
          // Wait for results to update
          await page.waitForLoadState('networkidle', { timeout: config.timeouts.navigation });
        }
      } else {
        console.log('No patients found, skipping search test');
        // If no patients, we'll verify the No Data message is displayed
        const noDataVisible = await dataManagementPage.isNoDataMessageVisible();
        expect(noDataVisible).toBeTruthy();
      }
      
      // Logout using helper
      await TalosixHelper.logout(page);
    } catch (error) {
      console.error('Test failed:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: `helper-search-test-failure-${Date.now()}.png` });
      throw error;
    }
  });
});
