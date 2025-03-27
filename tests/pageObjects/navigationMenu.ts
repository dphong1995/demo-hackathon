import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Navigation Menu page object for managing the sidebar menu
 */
export class NavigationMenu extends BasePage {
  // Main sections
  readonly homeLink: Locator;
  readonly patientManagementMenu: Locator;
  readonly siteDataManagementLink: Locator;
  readonly randomizationLink: Locator;
  readonly commentsLink: Locator;
  readonly queryManagementLink: Locator;
  readonly eacMenu: Locator;
  readonly adverseEventsLink: Locator;
  readonly protocolDeviationLink: Locator;
  readonly concomitantMedicationLink: Locator;
  readonly informedConsentLink: Locator;
  readonly auditTrailLink: Locator;
  readonly systemLogLink: Locator;
  readonly analyticsMenu: Locator;
  readonly dataExportLink: Locator;
  readonly documentsMenu: Locator;
  readonly databaseLockMenu: Locator;
  readonly rtsmMenu: Locator;
  
  // Patient Management submenu
  readonly patientSummaryLink: Locator;
  readonly scheduleViewLink: Locator;
  readonly followUpManagementLink: Locator;
  readonly dataDeletionLink: Locator;
  readonly reviewLogLink: Locator;
  readonly jobsQueueLink: Locator;
  
  // Admin tools
  readonly settingsLink: Locator;
  readonly featureControlLink: Locator;
  readonly migrationLink: Locator;
  readonly sitesLink: Locator;
  readonly formsLink: Locator;
  readonly cohortsLink: Locator;
  readonly physiciansLink: Locator;
  readonly usersLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize all locators for the navigation menu
    this.homeLink = page.locator('a:has-text("Home")').or(
      page.locator('a[href="/"]')
    );
    
    this.patientManagementMenu = page.locator('button:has-text("Patient Management")').or(
      page.locator('button >> text=Patient Management')
    );
    
    this.patientSummaryLink = page.locator('a:has-text("Patient Summary")').or(
      page.locator('a[href="/patient-management/summary"]')
    );
    
    this.scheduleViewLink = page.locator('a:has-text("Schedule View")').or(
      page.locator('a[href="/patient-management/schedule"]')
    );
    
    this.followUpManagementLink = page.locator('a:has-text("Follow up Management")').or(
      page.locator('a[href="/patient-management/epro"]')
    );
    
    this.dataDeletionLink = page.locator('a:has-text("Data Deletion")').or(
      page.locator('a[href="/patient-management/data-deletion"]')
    );
    
    this.reviewLogLink = page.locator('a:has-text("Review Log")').or(
      page.locator('a[href="/patient-management/reviews"]')
    );
    
    this.jobsQueueLink = page.locator('a:has-text("Jobs Queue")').or(
      page.locator('a[href="/data-management/jobs"]')
    );
    
    this.siteDataManagementLink = page.locator('a:has-text("Site Data Management")').or(
      page.locator('a[href="/site-data-management"]')
    );
    
    this.randomizationLink = page.locator('a:has-text("Randomization")').or(
      page.locator('a[href="/randomization"]') 
    );
    
    this.commentsLink = page.locator('a:has-text("Comments")').or(
      page.locator('a[href="/comments"]')
    );
    
    this.queryManagementLink = page.locator('a:has-text("Query Management")').or(
      page.locator('a[href="/query-management"]')
    );
    
    this.eacMenu = page.locator('button:has-text("EAC")');
    
    this.adverseEventsLink = page.locator('a:has-text("Adverse Events")').or(
      page.locator('a[href="/adverse-events"]')
    );
    
    this.protocolDeviationLink = page.locator('a:has-text("Protocol Deviation")').or(
      page.locator('a[href="/protocol-deviations"]')
    );
    
    this.concomitantMedicationLink = page.locator('a:has-text("Concomitant Medication")').or(
      page.locator('a[href="/concomitant-medications"]')
    );
    
    this.informedConsentLink = page.locator('a:has-text("Informed Consent")').or(
      page.locator('a[href="/e-consents"]')
    );
    
    this.auditTrailLink = page.locator('a:has-text("Audit Trail")').or(
      page.locator('a[href="/analytics/audit-log"]')
    );
    
    this.systemLogLink = page.locator('a:has-text("System Log")').or(
      page.locator('a[href="/analytics/audit-trail-system-data"]')
    );
    
    this.analyticsMenu = page.locator('button:has-text("Analytics")');
    
    this.dataExportLink = page.locator('a:has-text("Data Export")').or(
      page.locator('a[href="/data-export"]')
    );
    
    this.documentsMenu = page.locator('button:has-text("Documents")');
    
    this.databaseLockMenu = page.locator('button:has-text("Database lock")');
    
    this.rtsmMenu = page.locator('button:has-text("RTSM")');
    
    // Admin tools
    this.settingsLink = page.locator('a:has-text("Settings")').or(
      page.locator('a[href="/registry/settings"]')
    );
    
    this.featureControlLink = page.locator('a:has-text("Feature Control")').or(
      page.locator('a[href="/registry/features"]')
    );
    
    this.migrationLink = page.locator('a:has-text("Migration")').or(
      page.locator('a[href="/migration-dashboard"]')
    );
    
    this.sitesLink = page.locator('a:has-text("Sites")').or(
      page.locator('a[href="/registry/sites"]')
    );
    
    this.formsLink = page.locator('a:has-text("Forms")').or(
      page.locator('a[href="/forms"]')
    );
    
    this.cohortsLink = page.locator('a:has-text("Cohorts/Treatments")').or(
      page.locator('a[href="/treatment"]')
    );
    
    this.physiciansLink = page.locator('a:has-text("Physicians")').or(
      page.locator('a[href="/physician"]')
    );
    
    this.usersLink = page.locator('a:has-text("users")').or(
      page.locator('a[href="/users"]')
    );
  }

  /**
   * Navigate to Patient Management -> Patient Summary page
   */
  async navigateToPatientSummary(): Promise<void> {
    try {
      console.log('Navigating to Patient Summary page');
      await this.takeScreenshot('before-patient-summary-nav');
      
      // Check if we're already on the Patient Summary page
      if (this.page.url().includes('/patient-management/summary')) {
        console.log('Already on Patient Summary page');
        return;
      }
      
      // Try direct navigation first
      await this.navigate('/patient-management/summary');
      
      // Check if navigation worked by URL
      if (this.page.url().includes('/patient-management/summary')) {
        console.log('Direct navigation to Patient Summary succeeded');
        return;
      }
      
      // If direct navigation failed, try via menu
      console.log('Direct navigation failed, trying via menu');
      await this.navigateViaMenu();
    } catch (error) {
      console.error('Navigation to Patient Summary failed:', error);
      await this.takeScreenshot('patient-summary-nav-failure');
      throw error;
    }
  }
  
  /**
   * Navigate to Patient Summary through the menu
   * @private
   */
  private async navigateViaMenu(): Promise<void> {
    try {
      // Go to home page as a starting point
      await this.navigate('/');
      
      // Expand Patient Management menu if it exists
      if (await this.isVisible(this.patientManagementMenu)) {
        console.log('Clicking Patient Management menu');
        await this.patientManagementMenu.click();
        await this.wait(1000); // Wait for menu to expand
      }
      
      // Look for Patient Summary link
      if (await this.isVisible(this.patientSummaryLink)) {
        console.log('Clicking Patient Summary link');
        await this.patientSummaryLink.click();
        await this.wait(2000); // Wait for navigation
      } else {
        console.warn('Patient Summary link not found');
        throw new Error('Could not find Patient Summary link');
      }
    } catch (error) {
      console.warn('Menu navigation failed:', error);
      throw error;
    }
  }
}
