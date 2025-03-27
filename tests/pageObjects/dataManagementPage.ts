import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for Data Management functionality
 * Encapsulates selectors and actions for the Data Management page
 */
export class DataManagementPage {
  // Page instance
  private page: Page;
  
  // Locators for elements on the page
  readonly dataManagementMenu: Locator;
  readonly dataManagementLink: Locator;
  readonly addPatientButton: Locator;
  readonly patientTable: Locator;
  readonly noDataMessage: Locator;
  readonly noDataImage: Locator;
  readonly patientSearchInput: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly successMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators with best possible selectors in order of preference
    // Data Management menu button in sidebar
    this.dataManagementMenu = page.locator('button:has-text(" Data Management")');
    
    // Data Management link in dropdown
    this.dataManagementLink = page.locator('a[href="/data-management"]');
    
    // Add Patient button
    this.addPatientButton = page.locator('[data-testid="add-patient-button"]').or(
      page.locator('[data-cy="add-patient"]').or(
        page.locator('#add-patient').or(
          page.locator('button:has-text("Add patient")')
        )
      )
    );
    
    // Patient table 
    this.patientTable = page.locator('[data-testid="patient-table"]').or(
      page.locator('[data-cy="patient-table"]').or(
        page.locator('#patient-table').or(
          page.locator('table')
        )
      )
    );
    
    // No data message and image
    this.noDataMessage = page.locator('p:has-text("No Data")');
    this.noDataImage = page.locator('img[alt="no-data"]');
    
    // Search input field
    this.patientSearchInput = page.locator('input[placeholder="Search..."]');
    
    // Search and clear buttons
    this.searchButton = page.locator('button:has-text("Search")');
    this.clearButton = page.locator('button:has-text("clear")');
    
    // Success message for patient operations
    this.successMessage = page.locator('[data-testid="success-message"]').or(
      page.locator('.success-message')
    );
  }
  
  /**
   * Navigate to the Data Management page
   */
  async navigateToDataManagement(): Promise<void> {
    try {
      console.log('Attempting to navigate to Data Management page');
      
      // Check if we're already on the Data Management page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/data-management')) {
        console.log('Already on Data Management page');
        return;
      }
      
      // First, click on the Data Management menu to expand it if needed
      const menuVisible = await this.dataManagementMenu.isVisible()
        .catch(() => false);
      
      if (menuVisible) {
        console.log('Clicking on Data Management menu');
        await this.dataManagementMenu.click();
        
        // Add a small delay to allow the menu to expand
        await this.page.waitForTimeout(1000);
        
        // Click on the Data Management link
        console.log('Clicking Data Management link');
        await this.dataManagementLink.click();
      } else {
        console.log('Direct navigation to Data Management');
        // If menu not visible, try direct URL navigation
        await this.page.goto('/data-management');
      }
      
      // Wait for navigation
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      console.log('Successfully navigated to Data Management page');
    } catch (error) {
      console.error('Navigation to Data Management failed:', error);
      await this.page.screenshot({ path: `data-management-nav-failure-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Open the Add Patient dialog
   */
  async openAddPatientDialog(): Promise<void> {
    try {
      // Navigate to Data Management page first
      await this.navigateToDataManagement();
      
      // Click the add patient button
      await this.addPatientButton.click();
      
      // Wait for the form to be visible
      await this.page.waitForSelector('form', { state: 'visible', timeout: 10000 });
      
      // Wait for any animations to complete
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.error('Failed to open Add Patient dialog:', error);
      await this.page.screenshot({ path: `add-patient-dialog-failure-${Date.now()}.png` });
      throw error;
    }
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
   * Check if "No Data" message is visible
   * @returns boolean indicating if "No Data" message is visible
   */
  async isNoDataMessageVisible(): Promise<boolean> {
    // Check for either the message text or the no-data image
    const messageVisible = await this.noDataMessage.isVisible()
      .catch(() => false);
    
    const imageVisible = await this.noDataImage.isVisible()
      .catch(() => false);
    
    return messageVisible || imageVisible;
  }
  
  /**
   * Get the total number of patients in the current view
   * @returns {Promise<number>} Number of patient rows
   */
  async getPatientCount(): Promise<number> {
    try {
      // Check if table exists first
      const tableVisible = await this.isPatientTableVisible();
      if (!tableVisible) {
        console.log('Patient table not visible, checking for no-data message');
        
        // Check if "No Data" message is displayed instead
        const isNoDataVisible = await this.isNoDataMessageVisible();
        
        if (isNoDataVisible) {
          console.log('No Data message is visible, returning 0');
          return 0;
        }
        
        console.warn('Patient table not found and no No Data message');
        return 0;
      }
      
      // Table is visible, count the rows
      return await this.patientTable.locator('tbody tr').count();
    } catch (error) {
      console.warn('Error getting patient count:', error);
      return 0;
    }
  }
  
  /**
   * Search for a patient 
   * @param searchTerm - The term to search for
   */
  async searchPatient(searchTerm: string): Promise<void> {
    try {
      // Navigate to Data Management page first
      await this.navigateToDataManagement();
      
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
      await this.patientSearchInput.fill(searchTerm);
      
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
   * Get the first patient ID from the table
   * @returns {Promise<string>} The ID of the first patient or empty string if none
   */
  async getFirstPatientId(): Promise<string> {
    try {
      // First check if table exists
      const tableVisible = await this.isPatientTableVisible();
      if (!tableVisible) {
        return "";
      }
      
      // Get the text from the first patient ID cell (second column, first row)
      const firstPatientCell = this.patientTable.locator('tbody tr').first().locator('td').nth(1);
      const patientId = await firstPatientCell.textContent() || "";
      return patientId.trim();
    } catch (error) {
      console.warn('Could not get first patient ID:', error);
      return "";
    }
  }
}