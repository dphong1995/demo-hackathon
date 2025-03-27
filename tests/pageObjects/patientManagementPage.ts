import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for Patient Management functionality
 * Encapsulates selectors and actions for the Patient Management pages
 */
export class PatientManagementPage {
  // Page instance
  private page: Page;
  
  // Locators for elements on the page
  readonly patientManagementMenu: Locator;
  readonly patientSummaryLink: Locator;
  readonly addPatientButton: Locator;
  readonly patientTable: Locator;
  readonly patientSearchInput: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly successMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators with best possible selectors in order of preference
    // Following the priority order: data-testid > data-* > id > other
    
    // Patient Management menu button needs to be clicked first
    this.patientManagementMenu = page.locator('button:has-text("Patient Management")');
    
    // Patient Summary link - prioritizing data-testid that was found in the error message
    this.patientSummaryLink = page.locator('[data-testid="patient-management-view"]').or(
      page.locator('a[href="/patient-management/summary"]')
    );
    
    // For Add Patient button, try to find by id first, then fallback to text
    this.addPatientButton = page.locator('#add-patient-btn').or(
      page.locator('button:has-text("Add patient")')
    );
    
    // Table selector with various fallbacks
    this.patientTable = page.locator('table');
    
    // Use placeholder attribute which is more specific than generic selectors
    this.patientSearchInput = page.locator('input[placeholder="Patient ID..."]');
    
    // For buttons with text, use the most precise selector possible
    this.searchButton = page.locator('button:has-text("Search")');
    this.clearButton = page.locator('button:has-text("clear")');
    
    // Success message locator
    this.successMessage = page.locator('text=Success Patient has been saved');
  }
  
  /**
   * Navigate to the Patient Summary page
   */
  async navigateToPatientSummary(): Promise<void> {
    try {
      console.log('Attempting to navigate to Patient Summary page');
      
      // Check if we're already on the Patient Summary page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/patient-management/summary')) {
        console.log('Already on Patient Summary page');
        // Just wait for the Add Patient button to be visible
        await this.addPatientButton.waitFor({ state: 'visible', timeout: 10000 });
        return;
      }
      
      console.log('Clicking on Patient Management menu');
      // First, click on the Patient Management menu to expand it if needed
      await this.patientManagementMenu.click();
      
      // Add a small delay to allow the menu to expand
      await this.page.waitForTimeout(1000);
      
      console.log('Checking if Patient Summary link is visible');
      // Check if the Patient Summary link is visible
      const isLinkVisible = await this.patientSummaryLink.isVisible()
        .catch(() => false);
      
      if (isLinkVisible) {
        console.log('Clicking Patient Summary link');
        // Click on the Patient Summary link
        await this.patientSummaryLink.click();
      } else {
        console.log('Link not visible, trying direct navigation');
        // If the link is not visible, try direct URL navigation
        await this.page.goto('/patient-management/summary');
      }
      
      // Wait for domcontentloaded which is faster than networkidle
      console.log('Waiting for page to load');
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      
      // Add a small delay for page stabilization
      await this.page.waitForTimeout(1000);
      
      // Verify we're on the correct page by checking for the Add Patient button
      console.log('Verifying presence of Add Patient button');
      await this.addPatientButton.waitFor({ state: 'visible', timeout: 10000 });
      
      console.log('Successfully navigated to Patient Summary page');
    } catch (error) {
      console.error('Navigation to Patient Summary failed:', error);
      // Take a screenshot for debugging purposes
      await this.page.screenshot({ path: `patient-summary-nav-failure-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Open the Add Patient dialog
   */
  async openAddPatientDialog(): Promise<void> {
    // Click the add patient button
    await this.addPatientButton.click();
    
    // Wait for the form to be visible
    await this.page.waitForSelector('form', { state: 'visible', timeout: 10000 });
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(500);
  }
  
  /**
   * Add a new patient with required fields
   * @param siteName - The name of the site to select
   * @param email - The primary email for the patient
   */
  async addPatient(siteName: string, email: string): Promise<void> {
    try {
      // Open the patient registration form
      await this.openAddPatientDialog();
      
      // Select site from dropdown
      // First check for any data-* attributes
      const siteSelector = this.page.locator('[data-testid="site-selector"]').or(
        this.page.locator('[data-role="site-selector"]').or(
          this.page.locator('#site-selector').or(
            this.page.locator('.react-select__control')
          )
        )
      );
      
      // Click to open the dropdown
      await siteSelector.click();
      
      // Get the input field in the dropdown
      const siteInput = this.page.locator('.react-select__input').or(
        this.page.locator('input[role="combobox"]')
      );
      
      // Type to filter and select
      await siteInput.fill(siteName);
      await this.page.waitForTimeout(500); // Wait for dropdown filtering
      await this.page.keyboard.press('Enter');
      
      // Fill in primary email (required field)
      // Look for data-testid first, then placeholder, then form field order
      const primaryEmailInput = this.page.locator('[data-testid="primary-email-input"]').or(
        this.page.locator('[data-role="primary-email"]').or(
          this.page.locator('#primary-email').or(
            this.page.locator('input[placeholder*="email" i]').or(
              this.page.locator('input').nth(2) // Fallback as last resort
            )
          )
        )
      );
      
      await primaryEmailInput.fill(email);
      
      // Submit the form and close the dialog
      const submitButton = this.page.locator('[data-testid="submit-and-close-button"]').or(
        this.page.locator('#submit-close-btn').or(
          this.page.locator('button:has-text("Submit & close")')
        )
      );
      
      await submitButton.click();
      
      // Wait for domcontentloaded instead of networkidle
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      
      // Add a delay for UI stabilization
      await this.page.waitForTimeout(1000);
      
      // Verify success message is displayed
      await expect(this.successMessage).toBeVisible({
        timeout: 10000
      });
    } catch (error) {
      console.error('Error adding patient:', error);
      // Take a screenshot for debugging purposes
      await this.page.screenshot({ path: `add-patient-error-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Check if patient table exists and is visible
   * @returns boolean indicating if patient table exists
   */
  async isPatientTableVisible(): Promise<boolean> {
    return await this.patientTable.isVisible()
      .catch(() => false);
  }
  
  /**
   * Get the total number of patients in the current view
   * @returns Number of patient rows in the table, or 0 if table not found
   */
  async getPatientCount(): Promise<number> {
    try {
      // Check if table exists first
      const tableVisible = await this.isPatientTableVisible();
      if (!tableVisible) {
        console.log('Patient table not visible, checking for no-data message');
        
        // Check if "No Data" message is displayed instead
        const noDataMessage = this.page.locator('text=No Data').or(
          this.page.locator('img[alt="no-data"]')
        );
        
        const isNoDataVisible = await noDataMessage.isVisible()
          .catch(() => false);
        
        if (isNoDataVisible) {
          console.log('No Data message is visible, returning 0');
          return 0;
        }
        
        // If neither table nor No Data message is visible, take a screenshot
        await this.page.screenshot({ path: `patient-table-not-found-${Date.now()}.png` });
        console.warn('Patient table not found and no No Data message');
        return 0;
      }
      
      // Table is visible, count the rows
      return await this.page.locator('table tbody tr').count();
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
      // Check if search input exists
      const searchVisible = await this.patientSearchInput.isVisible()
        .catch(() => false);
      
      if (!searchVisible) {
        console.warn('Patient search input not visible');
        await this.page.screenshot({ path: `search-input-not-found-${Date.now()}.png` });
        return;
      }
      
      // Clear any existing search text first
      await this.patientSearchInput.click({ clickCount: 3 });
      await this.patientSearchInput.press('Backspace');
      
      // Enter the search text
      await this.patientSearchInput.fill(patientId);
      
      // Check if search button exists
      const searchButtonVisible = await this.searchButton.isVisible()
        .catch(() => false);
      
      if (searchButtonVisible) {
        // Click search button
        await this.searchButton.click();
      } else {
        // Press Enter as fallback
        await this.patientSearchInput.press('Enter');
      }
      
      // Wait for domcontentloaded instead of networkidle
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      
      // Add a delay for results to appear
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.error('Error searching for patient:', error);
      await this.page.screenshot({ path: `search-patient-error-${Date.now()}.png` });
    }
  }
  
  /**
   * Clear the current search
   */
  async clearSearch(): Promise<void> {
    try {
      // Check if clear button exists
      const clearVisible = await this.clearButton.isVisible()
        .catch(() => false);
      
      if (!clearVisible) {
        console.warn('Clear button not visible');
        
        // Alternative: try clearing the search input and pressing Enter
        const searchVisible = await this.patientSearchInput.isVisible()
          .catch(() => false);
        
        if (searchVisible) {
          await this.patientSearchInput.click({ clickCount: 3 });
          await this.patientSearchInput.press('Backspace');
          await this.patientSearchInput.press('Enter');
        }
        
        return;
      }
      
      // Click the clear button
      await this.clearButton.click();
      
      // Wait for domcontentloaded instead of networkidle
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      
      // Add a delay for UI to refresh
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.error('Error clearing search:', error);
    }
  }
  
  /**
   * Check if a specific patient ID exists in the table
   * @param patientId - The patient ID to check for
   * @returns boolean indicating if the patient exists
   */
  async doesPatientExist(patientId: string): Promise<boolean> {
    try {
      // First check if table exists
      const tableVisible = await this.isPatientTableVisible();
      if (!tableVisible) {
        return false;
      }
      
      // Look for the patient ID in a button, which is how they appear in the table
      const patientCell = this.page.locator(`button:has-text("${patientId}")`);
      return await patientCell.isVisible().catch(() => false);
    } catch (error) {
      console.warn('Error checking if patient exists:', error);
      return false;
    }
  }
  
  /**
   * Get the first patient ID from the table
   * @returns The ID of the first patient in the table, or empty string if none
   */
  async getFirstPatientId(): Promise<string> {
    try {
      // First check if table exists
      const tableVisible = await this.isPatientTableVisible();
      if (!tableVisible) {
        return "";
      }
      
      // Get the text from the first patient ID cell (second column, first row)
      const firstPatientCell = this.page.locator('table tbody tr').first().locator('td').nth(1);
      const patientId = await firstPatientCell.textContent() || "";
      return patientId.trim();
    } catch (error) {
      console.warn('Could not get first patient ID:', error);
      return "";
    }
  }
}
