import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { NavigationMenu } from './navigationMenu';
import { PatientSummaryPage } from './patientSummaryPage';
import { PatientRegistrationForm } from './patientRegistrationForm';

/**
 * Main Patient Management Page Object
 * Integrates all patient management components
 */
export class PatientManagementPage extends BasePage {
  // Component page objects
  readonly navigationMenu: NavigationMenu;
  readonly patientSummary: PatientSummaryPage;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize component page objects
    this.navigationMenu = new NavigationMenu(page);
    this.patientSummary = new PatientSummaryPage(page);
  }

  /**
   * Navigate to the Patient Summary page
   */
  async navigateToPatientSummary(): Promise<void> {
    await this.navigationMenu.navigateToPatientSummary();
  }
  
  /**
   * Get the number of patients in the current view
   * @returns Number of patients
   */
  async getPatientCount(): Promise<number> {
    return this.patientSummary.getPatientCount();
  }
  
  /**
   * Search for a patient by ID
   * @param patientId Patient ID to search for
   */
  async searchPatient(patientId: string): Promise<void> {
    await this.patientSummary.searchPatient(patientId);
  }
  
  /**
   * Get the first patient ID from the results
   * @returns First patient ID or empty string
   */
  async getFirstPatientId(): Promise<string> {
    return this.patientSummary.getFirstPatientId();
  }
  
  /**
   * Check if a patient exists
   * @param patientId Patient ID to check for
   * @returns Boolean indicating if patient exists
   */
  async doesPatientExist(patientId: string): Promise<boolean> {
    return this.patientSummary.doesPatientExist(patientId);
  }
  
  /**
   * Add a new patient with full details
   * @param siteName Site name to select
   * @param primaryEmail Primary email for patient
   * @param secondaryEmail Optional secondary email
   * @returns The created patient ID
   */
  async addPatient(siteName: string, primaryEmail: string, secondaryEmail?: string): Promise<string> {
    try {
      console.log(`Adding new patient with site: ${siteName}, email: ${primaryEmail}`);
      
      // Open the registration form
      await this.patientSummary.openAddPatientDialog();
      
      // Create registration form object
      const registrationForm = new PatientRegistrationForm(this.page);
      
      // Fill and submit the form
      const patientId = await registrationForm.fillAndSubmitForm({
        site: siteName,
        primaryEmail,
        secondaryEmail
      });
      
      // Wait for the form to close and return to patient list
      await this.wait(2000);
      
      // Verify the patient was successfully added
      if (patientId) {
        console.log(`Successfully added patient with ID: ${patientId}`);
        
        // Try to check if the patient exists in the list
        const exists = await this.doesPatientExist(patientId);
        if (exists) {
          console.log(`Confirmed patient ${patientId} exists in the table`);
        } else {
          console.warn(`Could not confirm patient ${patientId} in the table, but ID was generated`);
        }
      } else {
        console.warn('No patient ID was captured during registration');
      }
      
      return patientId;
    } catch (error) {
      console.error('Error adding patient:', error);
      await this.takeScreenshot('add-patient-error');
      throw error;
    }
  }
  
  /**
   * Open a patient's profile
   * @param patientId ID of the patient to open
   */
  async openPatientProfile(patientId: string): Promise<void> {
    await this.patientSummary.openPatientProfile(patientId);
  }
}
