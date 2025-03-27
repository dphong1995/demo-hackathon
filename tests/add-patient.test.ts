import { test, expect } from '@playwright/test';
import { LoginPage, StudySelectionPage, PatientManagementPage } from './pageObjects';
import { config } from './testData/test-config';
import { patientTestData } from './testData/patientTestData';

/**
 * Test suite for Patient Management - Add Patient functionality
 * Using extended timeouts to accommodate slow server
 */
test.describe('Patient Management - Add Patient Tests', () => {
  // Set a longer timeout for this specific test
  test.setTimeout(180000); // 3 minutes timeout for this test

  test('should add a patient to TEST - LANTERN study and open patient profile', async ({ page }) => {
    try {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const studySelectionPage = new StudySelectionPage(page);
      const patientManagementPage = new PatientManagementPage(page);

      // Use the LANTERN study from the test data
      const testStudy = patientTestData.studies.lantern;

      // Use the Site 1 for patient assignment
      const testSite = patientTestData.sites.site1;

      // Generate a unique email for the patient
      const primaryEmail = patientTestData.generateUniqueEmail();
      const secondaryEmail = patientTestData.generateUniqueEmail('backup');

      console.log('Test configuration:');
      console.log(`- Study: ${testStudy.name}`);
      console.log(`- Site: ${testSite.displayName}`);
      console.log(`- Primary Email: ${primaryEmail}`);

      // Step 1: Navigate to the application and login
      console.log('Navigating to the application and logging in...');
      await page.goto(config.baseUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
      await loginPage.login(config.credentials.username, config.credentials.password);

      // Step 2: Select the TEST - LANTERN study
      console.log('Selecting the study...');
      await studySelectionPage.selectStudy(testStudy.name);

      // Step 3: Navigate to Patient Management -> Patient Summary
      console.log('Navigating to Patient Management...');
      await patientManagementPage.navigateToPatientSummary();

      // Capture the current patient count for validation
      const initialPatientCount = await patientManagementPage.getPatientCount();
      console.log(`Initial patient count: ${initialPatientCount}`);

      // Step 4: Add a new patient
      console.log('Adding a new patient...');
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      const patientId = await patientManagementPage.addPatient(
        testSite.displayName,
        primaryEmail,
        secondaryEmail
      );

      console.log(`New patient added with ID: ${patientId}`);

      // Step 5: Verify the patient was added by searching for it
      console.log('Verifying patient was added...');
      const exists = await patientManagementPage.doesPatientExist(patientId);
      expect(exists).toBeTruthy();

      // Step 6: Open the patient profile
      console.log(`Opening patient profile for: ${patientId}`);
      await patientManagementPage.openPatientProfile(patientId);

      // Verify we're on the patient profile page by checking the URL
      const currentUrl = page.url();
      expect(currentUrl).toContain('/patient-management/profile/');
      console.log(`Successfully opened patient profile: ${currentUrl}`);

      // Clean up - log out after test
      await loginPage.logout();
    } catch (error) {
      console.error('Test failed:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: `add-patient-test-failure-${Date.now()}.png` });
      throw error;
    }
  });
});
