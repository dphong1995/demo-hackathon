import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Patient Summary Page Object
 * For interacting with the patient summary list page
 */
export class PatientSummaryPage extends BasePage {
  // Search and add section
  readonly patientIdSearchInput: Locator;
  readonly clearButton: Locator;
  readonly searchButton: Locator;
  readonly addPatientButton: Locator;

  // Table and results
  readonly patientTable: Locator;
  readonly noDataMessage: Locator;

  // Filter tabs
  readonly summaryTab: Locator;
  readonly visitStatusTab: Locator;
  readonly dispositionTab: Locator;
  readonly patientStatusTab: Locator;
  readonly progressTab: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize all locators for the Patient Summary page
    this.patientIdSearchInput = page.locator('input[placeholder="Patient ID..."]').or(
      page.locator('input[placeholder*="Patient"]')
    );

    this.clearButton = page.locator('button:has-text("clear")').or(
      page.locator('button >> text=clear')
    );

    this.searchButton = page.locator('button:has-text("Search")').or(
      page.locator('button >> text=Search')
    );

    this.addPatientButton = page.locator('#add-patient-btn').or(
      page.locator('[data-testid="add-patient-button"]').or(
        page.locator('button:has-text("Add patient")').or(
          page.locator('button >> text=Add patient')
        )
      )
    );

    this.patientTable = page.locator('table');

    this.noDataMessage = page.locator('text=No Data').or(
      page.locator('text=No data').or(
        page.locator('img[alt="no-data"]')
      )
    );

    // Tabs/filters
    this.summaryTab = page.locator('text=Summary');
    this.visitStatusTab = page.locator('text=Visit Status');
    this.dispositionTab = page.locator('text=Disposition');
    this.patientStatusTab = page.locator('text=Patient Status');
    this.progressTab = page.locator('text=Progress');
  }

  /**
   * Check if patient table exists and is visible
   * @returns boolean indicating if patient table exists
   */
  async isPatientTableVisible(): Promise<boolean> {
    try {
      // Try multiple selectors for the table
      const tableSelectors = [
        'table',
        '[role="table"]',
        '.data-table',
        'div[class*="table"]'
      ];

      for (const selector of tableSelectors) {
        const isVisible = await this.page.locator(selector).first().isVisible({ timeout: this.actionTimeout })
          .catch(() => false);

        if (isVisible) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn('Error checking if patient table is visible:', error);
      return false;
    }
  }

  /**
   * Get the total number of patients in the current view
   * @returns Number of patient rows in the table, or 0 if table not found
   */
  async getPatientCount(): Promise<number> {
    try {
      // Take screenshot to see current state
      await this.takeScreenshot('patient-count-check');

      // Check if table exists first
      const tableVisible = await this.isPatientTableVisible();
      if (!tableVisible) {
        console.log('Patient table not visible, checking for no-data message');

        const isNoDataVisible = await this.isVisible(this.noDataMessage);

        if (isNoDataVisible) {
          console.log('No Data message is visible, returning 0');
          return 0;
        }

        // If neither table nor No Data message is visible, take a screenshot
        await this.takeScreenshot('patient-table-not-found');
        console.warn('Patient table not found and no No Data message');
        return 0;
      }

      // Try multiple selectors for table rows
      const rowSelectors = [
        'table tbody tr',
        '[role="table"] [role="row"]',
        '.data-table .data-row',
        'div[class*="table"] div[class*="row"]'
      ];

      for (const selector of rowSelectors) {
        const count = await this.page.locator(selector).count()
          .catch(() => 0);

        if (count > 0) {
          console.log(`Found ${count} patients using selector: ${selector}`);
          return count;
        }
      }

      return 0;
    } catch (error) {
      console.warn('Error getting patient count:', error);
      return 0;
    }
  }

  /**
   * Search for a patient by ID
   * @param patientId - The ID to search for
   */
  async searchPatient(patientId: string): Promise<void> {
    try {
      // Take screenshot before search
      await this.takeScreenshot('before-patient-search');

      if (!await this.isVisible(this.patientIdSearchInput)) {
        console.warn('Patient search input not visible');
        await this.takeScreenshot('search-input-not-found');
        return;
      }

      // Clear any existing search text first
      await this.patientIdSearchInput.click({ clickCount: 3 });
      await this.patientIdSearchInput.press('Backspace');

      // Enter the search text
      await this.patientIdSearchInput.fill(patientId);

      // Try clicking search button first
      if (await this.isVisible(this.searchButton)) {
        await this.searchButton.click();
      } else {
        // Press Enter as fallback
        console.log('Search button not found, pressing Enter');
        await this.patientIdSearchInput.press('Enter');
      }

      // Wait for search results
      await this.page.waitForLoadState('domcontentloaded', { timeout: this.navigationTimeout });
      await this.wait(2000); // Extra wait for results to appear

      // Take screenshot after search
      await this.takeScreenshot('after-patient-search');
    } catch (error) {
      console.error('Error searching for patient:', error);
      await this.takeScreenshot('search-patient-error');
    }
  }

  /**
   * Clear the current search
   */
  async clearSearch(): Promise<void> {
    try {
      // Check if clear button exists
      if (await this.isVisible(this.clearButton)) {
        await this.clearButton.click();
      } else {
        console.warn('Clear button not visible');

        // Alternative: try clearing the search input and pressing Enter
        if (await this.isVisible(this.patientIdSearchInput)) {
          await this.patientIdSearchInput.click({ clickCount: 3 });
          await this.patientIdSearchInput.press('Backspace');
          await this.patientIdSearchInput.press('Enter');
        }
      }

      // Wait for results to refresh
      await this.page.waitForLoadState('domcontentloaded', { timeout: this.navigationTimeout });
      await this.wait(1000);
    } catch (error) {
      console.error('Error clearing search:', error);
      await this.takeScreenshot('clear-search-error');
    }
  }

  /**
   * Get the first patient ID from the table
   * @returns The ID of the first patient in the table, or empty string if none
   */
  async getFirstPatientId(): Promise<string> {
    try {
      // Take screenshot to debug
      await this.takeScreenshot('get-first-patient-id');

      // First check if table exists
      const tableVisible = await this.isPatientTableVisible();
      if (!tableVisible) {
        return "";
      }

      // Try different approaches to get the patient ID

      // 1. Look for a button that might contain the patient ID
      const idButtonSelectors = [
        'button[id*="patient"]',
        'button:not(:has-text("Add"))',
        'td:nth-child(2) button', // Second column buttons
        'td button'
      ];

      for (const selector of idButtonSelectors) {
        const buttons = this.page.locator(selector);
        const count = await buttons.count().catch(() => 0);

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const text = await buttons.nth(i).textContent() || "";
            const trimmed = text.trim();

            if (trimmed && /\d/.test(trimmed)) { // If it contains numbers
              console.log(`Found patient ID button: ${trimmed}`);
              return trimmed;
            }
          }
        }
      }

      // 2. Try getting from table cells directly
      const cellSelectors = [
        'table tbody tr:first-child td:nth-child(2)', // Second column first row
        'table tbody tr:first-child td', // Any cell in first row
        '[role="table"] [role="row"]:first-child [role="cell"]:nth-child(2)'
      ];

      for (const selector of cellSelectors) {
        const cell = this.page.locator(selector).first();
        const isVisible = await this.isVisible(cell);

        if (isVisible) {
          const text = await cell.textContent() || "";
          const trimmed = text.trim();

          if (trimmed && /\d/.test(trimmed)) {
            console.log(`Found patient ID in cell: ${trimmed}`);
            return trimmed;
          }
        }
      }

      console.warn('Could not find patient ID in table');
      await this.takeScreenshot('patient-id-not-found');
      return "";
    } catch (error) {
      console.warn('Could not get first patient ID:', error);
      return "";
    }
  }

  /**
   * Check if a patient exists in the table
   * @param patientId - Patient ID to check for
   * @returns Boolean indicating if patient exists
   */
  async doesPatientExist(patientId: string): Promise<boolean> {
    try {
      // First search for the patient
      await this.searchPatient(patientId);

      // Look for a patient ID button or cell matching the patientId
      const patientSelector = `button:has-text("${patientId}")`;

      return await this.page.locator(patientSelector).isVisible({ timeout: this.elementTimeout })
        .catch(() => false);
    } catch (error) {
      console.warn(`Error checking if patient ${patientId} exists:`, error);
      return false;
    }
  }

  /**
   * Open the patient registration form
   * @returns PatientRegistrationForm instance
   */
  async openAddPatientDialog(): Promise<void> {
    try {
      console.log('Attempting to open Add Patient dialog');
      await this.takeScreenshot('before-add-patient');

      // Make sure Add Patient button is visible
      if (!await this.isVisible(this.addPatientButton)) {
        console.error('Add Patient button not visible');
        throw new Error('Add Patient button not found');
      }

      // Click the add patient button
      await this.addPatientButton.click();

      // Wait for the dialog or form to appear
      // Look for common form elements or dialog content
      const formSelector = 'text=PATIENT REGISTRATION FORM, form, div:has-text("Patient registration"), dialog';

      await this.page.waitForSelector(formSelector, { state: 'visible', timeout: this.elementTimeout })
        .catch(async () => {
          console.error('Form not found after clicking Add Patient');
          await this.takeScreenshot('form-not-found');
          throw new Error('Form not found after clicking Add Patient');
        });

      // Take a screenshot after form appears
      await this.takeScreenshot('add-patient-form');

      console.log('Add Patient dialog opened successfully');
    } catch (error) {
      console.error('Error opening Add Patient dialog:', error);
      await this.takeScreenshot('add-patient-dialog-error');
      throw error;
    }
  }

  /**
   * Open a patient's profile by ID
   * @param patientId - ID of the patient to open
   */
  async openPatientProfile(patientId: string): Promise<void> {
    try {
      // First search for the patient if not already searching
      if (!(await this.patientIdSearchInput.inputValue()).includes(patientId)) {
        await this.searchPatient(patientId);
      }

      // Find and click the patient ID button
      const patientButton = this.page.locator(`button:has-text("${patientId}")`).first();

      if (!await this.isVisible(patientButton)) {
        console.error(`Patient button for ID ${patientId} not found`);
        await this.takeScreenshot('patient-button-not-found');
        throw new Error(`Patient ${patientId} not found`);
      }

      // Click the button to open patient profile
      await patientButton.click();

      // Wait for navigation to complete
      await this.page.waitForLoadState('networkidle', { timeout: this.navigationTimeout });

      // Verify we're on the patient profile page
      if (!this.page.url().includes('/patient-management/profile/')) {
        console.error('Navigation to patient profile failed');
        await this.takeScreenshot('patient-profile-nav-failed');
        throw new Error('Failed to navigate to patient profile');
      }

      console.log(`Successfully opened profile for patient ${patientId}`);
    } catch (error) {
      console.error('Error opening patient profile:', error);
      await this.takeScreenshot('open-patient-profile-error');
      throw error;
    }
  }
}
