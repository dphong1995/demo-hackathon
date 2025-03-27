import { test, expect } from './fixture/auth-fixture';
import { DataManagementPage } from './pageObjects';
import { createStudyFixture } from './fixture/auth-fixture';

// Create a fixture for our test study
const testStudyFixture = createStudyFixture('3 Xuan Testing');

/**
 * Test suite for data management using the fixtures
 * This demonstrates how to use the fixtures for cleaner tests
 */
testStudyFixture('should navigate to Data Management with fixture', async ({ authenticatedStudyPage: page }) => {
  // Initialize page objects (already logged in and study selected)
  const dataManagementPage = new DataManagementPage(page);
  
  try {
    // Navigate to Data Management page
    await dataManagementPage.navigateToDataManagement();
    
    // Verify we're on the Data Management page by checking for the Add Patient button
    await expect(dataManagementPage.addPatientButton).toBeVisible({ timeout: 10000 });
    
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
  } catch (error) {
    console.error('Test failed:', error);
    // Take a screenshot for debugging
    await page.screenshot({ path: `fixture-test-failure-${Date.now()}.png` });
    throw error;
  }
});
