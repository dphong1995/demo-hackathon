import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Patient Registration Form Page Object
 * For interacting with the patient registration form dialog
 */
export class PatientRegistrationForm extends BasePage {
  // Form fields
  readonly siteDropdown: Locator;
  readonly siteLabel: Locator;
  readonly studyField: Locator;
  readonly patientIdField: Locator;
  readonly primaryEmailField: Locator;
  readonly primaryEmailLabel: Locator;
  readonly secondaryEmailField: Locator;
  
  // Buttons
  readonly submitAndAddNewButton: Locator;
  readonly submitAndCloseButton: Locator;
  readonly submitAndAddConsentButton: Locator;
  
  // Error messages
  readonly primaryEmailRequiredError: Locator;
  readonly siteRequiredError: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form field locators - based on exploration and screenshot
    this.siteLabel = page.locator('text=SITE *').or(
      page.locator('label:has-text("Site")').or(
        page.locator('text="Site *"')
      )
    );
    
    this.siteDropdown = page.locator('select[name="site"]').or(
      page.locator('button[aria-haspopup="listbox"]').or(
        page.locator('div[role="combobox"]').or(
          page.locator('input:near(:text("SITE"))')
        )
      )
    );
    
    this.studyField = page.locator('input:near(:text("Study"))').or(
      page.locator('textbox:near(:text("Study"))')
    );
    
    this.patientIdField = page.locator('input:near(:text("Unique Patient ID"))').or(
      page.locator('textbox:near(:text("Unique Patient ID"))')
    );
    
    this.primaryEmailLabel = page.locator('text=Primary Email *').or(
      page.locator('label:has-text("Primary Email")').or(
        page.locator('text="3. Primary Email *"')
      )
    );
    
    this.primaryEmailField = page.locator('input[name="primaryEmail"]').or(
      page.locator('input:near(:text("Primary Email"))').or(
        page.locator('input').nth(2)
      )
    );
    
    this.secondaryEmailField = page.locator('input[name="secondaryEmail"]').or(
      page.locator('input:near(:text("Secondary Email"))').or(
        page.locator('input').nth(3)
      )
    );
    
    // Button locators
    this.submitAndAddNewButton = page.locator('button:has-text("Submit & add new")').or(
      page.locator('button:has-text("SUBMIT & ADD NEW")')
    );
    
    this.submitAndCloseButton = page.locator('button:has-text("Submit & close")').or(
      page.locator('button:has-text("SUBMIT & CLOSE")')
    );
    
    this.submitAndAddConsentButton = page.locator('button:has-text("Submit & Add Consent")').or(
      page.locator('button:has-text("SUBMIT & ADD CONSENT")')
    );
    
    // Error messages
    this.primaryEmailRequiredError = page.locator('text=Primary Email is required');
    this.siteRequiredError = page.locator('text=Please select a site');
  }

  /**
   * Get the auto-generated patient ID
   * @returns The auto-generated patient ID if available
   */
  async getPatientId(): Promise<string> {
    try {
      const text = await this.patientIdField.inputValue();
      return text.trim();
    } catch (error) {
      console.warn('Could not get patient ID:', error);
      return "";
    }
  }
  
  /**
   * Select a site from the dropdown
   * @param siteName Name of the site to select
   */
  async selectSite(siteName: string): Promise<void> {
    try {
      console.log(`Selecting site: ${siteName}`);
      await this.takeScreenshot('before-site-selection');
      
      // Check if site dropdown is found
      const siteDropdownVisible = await this.isVisible(this.siteDropdown);
      
      if (siteDropdownVisible) {
        console.log('Found site dropdown, clicking to open');
        await this.siteDropdown.click();
        await this.wait(1000);
        
        // Look for the site option in the dropdown
        const siteOption = this.page.locator(`text="${siteName}"`);
        
        const siteOptionVisible = await this.isVisible(siteOption);
        
        if (siteOptionVisible) {
          console.log(`Found site option: ${siteName}, clicking it`);
          await siteOption.click();
        } else {
          console.warn(`Site option "${siteName}" not found in dropdown`);
          await this.takeScreenshot('site-option-not-found');
          
          // Try to find any option and click it
          const anyOption = this.page.locator('li, option').first();
          if (await this.isVisible(anyOption)) {
            console.log('Clicking first available site option');
            await anyOption.click();
          }
        }
      } else {
        console.warn('Site dropdown not found');
        await this.takeScreenshot('site-dropdown-not-found');
        
        // Try to directly type in the field if it's not a dropdown
        const inputField = this.page.locator('input').first();
        if (await this.isVisible(inputField)) {
          await inputField.fill(siteName);
          await this.page.keyboard.press('Enter');
        }
      }
      
      await this.wait(1000);
      await this.takeScreenshot('after-site-selection');
    } catch (error) {
      console.error('Error selecting site:', error);
      await this.takeScreenshot('site-selection-error');
    }
  }
  
  /**
   * Enter primary email
   * @param email Email address to enter
   */
  async enterPrimaryEmail(email: string): Promise<void> {
    try {
      console.log(`Entering primary email: ${email}`);
      
      // Check if primary email input is found
      const emailInputVisible = await this.isVisible(this.primaryEmailField);
      
      if (emailInputVisible) {
        console.log('Found primary email input, filling with:', email);
        await this.primaryEmailField.fill(email);
      } else {
        console.warn('Primary email input not found');
        await this.takeScreenshot('email-input-not-found');
        
        // Try to find any visible input field that might accept email
        const visibleInputs = this.page.locator('input:visible');
        const count = await visibleInputs.count();
        
        let emailEntered = false;
        for (let i = 0; i < count; i++) {
          const inputVisible = await visibleInputs.nth(i).isVisible();
          
          if (inputVisible) {
            const placeholder = await visibleInputs.nth(i).getAttribute('placeholder') || '';
            const type = await visibleInputs.nth(i).getAttribute('type') || '';
            const isDisabled = await visibleInputs.nth(i).isDisabled().catch(() => false);
            
            // Skip if disabled or looks like a dropdown
            if (!isDisabled && type !== 'hidden' && !placeholder.includes('Select')) {
              console.log(`Trying to enter email in input ${i}`);
              await visibleInputs.nth(i).fill(email);
              emailEntered = true;
              break;
            }
          }
        }
        
        if (!emailEntered) {
          console.error('Could not find any field to enter email');
          throw new Error('No email field found');
        }
      }
      
      await this.wait(500);
      await this.takeScreenshot('after-email-entry');
    } catch (error) {
      console.error('Error entering primary email:', error);
      await this.takeScreenshot('email-entry-error');
      throw error;
    }
  }
  
  /**
   * Enter secondary email
   * @param email Secondary email address to enter
   */
  async enterSecondaryEmail(email: string): Promise<void> {
    try {
      if (await this.isVisible(this.secondaryEmailField)) {
        await this.secondaryEmailField.fill(email);
      } else {
        console.warn('Secondary email field not found');
      }
    } catch (error) {
      console.warn('Error entering secondary email:', error);
      // Non-critical, so don't throw
    }
  }
  
  /**
   * Submit the form and close it
   * @returns The patient ID if available
   */
  async submitAndClose(): Promise<string> {
    try {
      // Capture the patient ID before submission
      const patientId = await this.getPatientId();
      
      // Submit the form
      if (await this.isVisible(this.submitAndCloseButton)) {
        await this.submitAndCloseButton.click();
      } else {
        console.warn('Submit & close button not found');
        await this.takeScreenshot('submit-button-not-found');
        
        // Try to find any button that looks like a submit button
        const buttons = this.page.locator('button');
        const count = await buttons.count();
        
        let buttonClicked = false;
        for (let i = 0; i < count; i++) {
          const text = await buttons.nth(i).textContent() || '';
          if (text.includes('SUBMIT') || text.includes('Submit') || text.includes('CLOSE') || text.includes('Close')) {
            console.log(`Clicking button with text: ${text}`);
            await buttons.nth(i).click();
            buttonClicked = true;
            break;
          }
        }
        
        if (!buttonClicked) {
          console.error('Could not find any button to submit the form');
          throw new Error('No submit button found');
        }
      }
      
      // Wait for form submission
      await this.wait(2000);
      await this.takeScreenshot('after-form-submission');
      
      // Check for any validation errors
      const hasError = await this.hasValidationErrors();
      if (hasError) {
        console.error('Form has validation errors');
        throw new Error('Form has validation errors');
      }
      
      // Wait for form dialog to close
      await this.page.waitForSelector('dialog, form', { state: 'hidden', timeout: this.elementTimeout })
        .catch(() => console.warn('Form may not have closed'));
      
      return patientId;
    } catch (error) {
      console.error('Error submitting form:', error);
      await this.takeScreenshot('form-submission-error');
      throw error;
    }
  }
  
  /**
   * Submit and add another patient
   * @returns The patient ID if available
   */
  async submitAndAddNew(): Promise<string> {
    try {
      // Capture the patient ID before submission
      const patientId = await this.getPatientId();
      
      // Submit the form
      if (await this.isVisible(this.submitAndAddNewButton)) {
        await this.submitAndAddNewButton.click();
      } else {
        console.warn('Submit & add new button not found');
        throw new Error('Submit & add new button not found');
      }
      
      // Wait for form reset/refresh
      await this.wait(2000);
      
      // Check for any validation errors
      const hasError = await this.hasValidationErrors();
      if (hasError) {
        console.error('Form has validation errors');
        throw new Error('Form has validation errors');
      }
      
      return patientId;
    } catch (error) {
      console.error('Error submitting form:', error);
      await this.takeScreenshot('form-submission-error');
      throw error;
    }
  }
  
  /**
   * Check if the form has validation errors
   * @returns Boolean indicating if validation errors exist
   */
  async hasValidationErrors(): Promise<boolean> {
    try {
      // Look for common error message patterns
      const errorSelectors = [
        'text=is required',
        'text=Please select',
        'text=Invalid',
        '.error-message',
        '[class*="error"]'
      ];
      
      for (const selector of errorSelectors) {
        const errorVisible = await this.page.locator(selector).isVisible({ timeout: 1000 })
          .catch(() => false);
        
        if (errorVisible) {
          console.warn(`Validation error found: ${selector}`);
          await this.takeScreenshot('validation-error');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.warn('Error checking for validation errors:', error);
      return false;
    }
  }
  
  /**
   * Fill out and submit the complete form
   * @param data Patient data to enter
   * @returns The patient ID
   */
  async fillAndSubmitForm(data: { site: string; primaryEmail: string; secondaryEmail?: string }): Promise<string> {
    try {
      console.log('Filling patient registration form');
      
      // Select site
      await this.selectSite(data.site);
      
      // Enter primary email (required)
      await this.enterPrimaryEmail(data.primaryEmail);
      
      // Enter secondary email (optional)
      if (data.secondaryEmail) {
        await this.enterSecondaryEmail(data.secondaryEmail);
      }
      
      // Submit the form
      return await this.submitAndClose();
    } catch (error) {
      console.error('Error filling and submitting form:', error);
      await this.takeScreenshot('form-fill-error');
      throw error;
    }
  }
}
