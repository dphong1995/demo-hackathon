import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Study Selection functionality
 * Encapsulates selectors and actions for the Study Selection page
 */
export class StudySelectionPage {
  // Page instance
  private page: Page;
  
  // Locators for elements on the page
  readonly studyTable: Locator;
  readonly studySearchInput: Locator;
  readonly studyRows: Locator;
  readonly loadingIndicator: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using best practices selectors in priority order
    this.studyTable = page.locator('[data-testid="study-table"]').or(
      page.locator('[data-cy="study-table"]').or(
        page.locator('#study-table').or(
          page.locator('table')
        )
      )
    );
    
    this.studySearchInput = page.locator('[data-testid="study-search"]').or(
      page.locator('[data-cy="study-search"]').or(
        page.locator('#study-search').or(
          page.locator('input[placeholder="Search"]')
        )
      )
    );
    
    this.studyRows = page.locator('[data-testid="study-row"]').or(
      page.locator('[data-cy="study-row"]').or(
        page.locator('table tbody tr')
      )
    );
    
    this.loadingIndicator = page.locator('[data-testid="loading-indicator"]').or(
      page.locator('.loading-spinner')
    );
  }
  
  /**
   * Navigate to the Study Selection page
   */
  async navigateToStudySelection(): Promise<void> {
    try {
      console.log('Navigating to study selection page');
      
      // Check if we're already on the study selection page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/select-study')) {
        // Wait for study table to be visible
        await this.studyTable.waitFor({ state: 'visible', timeout: 10000 });
        console.log('Already on study selection page');
        return;
      }
      
      // Navigate to studies page
      await this.page.goto('/select-study');
      
      // Wait for page to load
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Wait for study table to be visible
      await this.studyTable.waitFor({ state: 'visible', timeout: 10000 });
      
      console.log('Successfully navigated to study selection page');
    } catch (error) {
      console.error('Navigation to study selection failed:', error);
      await this.page.screenshot({ path: `study-nav-failure-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Select a study by name
   * @param studyName - The name of the study to select
   */
  async selectStudy(studyName: string): Promise<void> {
    try {
      console.log(`Attempting to select study: ${studyName}`);
      
      // Make sure we're on the study selection page
      await this.navigateToStudySelection();
      
      // Check if search input exists
      const searchVisible = await this.studySearchInput.isVisible()
        .catch(() => false);
      
      if (searchVisible) {
        console.log('Using search to find study');
        // Clear any existing text
        await this.studySearchInput.click({ clickCount: 3 });
        await this.studySearchInput.press('Backspace');
        
        // Search for the study
        await this.studySearchInput.fill(studyName);
        await this.page.waitForTimeout(1000); // Wait for search results
      }
      
      // Look for the study by name
      // Using cell element since we've identified the structure through our exploration
      const studyCell = this.page.locator(`table tbody tr td:has-text("${studyName}")`);
      
      // Wait for row to be visible
      await studyCell.waitFor({ state: 'visible', timeout: 10000 });
      
      // Click on the study name cell
      await studyCell.click();
      
      // Wait for loading indicator to appear/disappear if it exists
      const loadingAppeared = await this.loadingIndicator.isVisible({ timeout: 5000 })
        .catch(() => false);
      
      if (loadingAppeared) {
        // Wait for loading indicator to disappear
        await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
      }
      
      // Wait for navigation and page to stabilize
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
      
      console.log(`Successfully selected study: ${studyName}`);
    } catch (error) {
      console.error('Study selection failed:', error);
      await this.page.screenshot({ path: `study-selection-failure-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Get the list of available studies
   * @returns Array of study names
   */
  async getAvailableStudies(): Promise<string[]> {
    try {
      // Make sure we're on the study selection page
      await this.navigateToStudySelection();
      
      // Get all study rows
      const studyCount = await this.studyRows.count();
      const studies: string[] = [];
      
      // Extract study names (in the second column)
      for (let i = 0; i < studyCount; i++) {
        const row = this.studyRows.nth(i);
        
        // Get the name cell (second column)
        const nameCell = row.locator('td').nth(1);
        
        const name = await nameCell.textContent() || "";
        if (name.trim()) {
          studies.push(name.trim());
        }
      }
      
      return studies;
    } catch (error) {
      console.error('Failed to get available studies:', error);
      return [];
    }
  }
  
  /**
   * Check if a specific study exists
   * @param studyName - The name of the study to check for
   * @returns Boolean indicating if the study exists
   */
  async doesStudyExist(studyName: string): Promise<boolean> {
    try {
      // Get all available studies
      const studies = await this.getAvailableStudies();
      
      // Check if study name exists in the list
      return studies.some(study => study.includes(studyName));
    } catch (error) {
      console.warn('Error checking if study exists:', error);
      return false;
    }
  }
}