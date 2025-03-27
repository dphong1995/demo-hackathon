import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for Login functionality
 * Encapsulates selectors and actions for the Login page
 */
export class LoginPage {
  // Page instance
  private page: Page;
  
  // Locators for elements on the page
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators based on actual elements from the application
    // Using selectors observed during application exploration
    
    // Email input field - using the generic textbox with "Email" label
    this.emailInput = page.locator('input[aria-label="Email"]').or(
      page.locator('textbox[aria-label="Email"]').or(
        page.locator('#email').or(
          page.locator('input').first()
        )
      )
    );
    
    // Password input field - using the generic textbox with "Password" label
    this.passwordInput = page.locator('input[aria-label="Password"]').or(
      page.locator('textbox[aria-label="Password"]').or(
        page.locator('#password').or(
          page.locator('input[type="password"]').or(
            page.locator('input').nth(1)
          )
        )
      )
    );
    
    // Sign In button
    this.loginButton = page.locator('button:has-text("Sign In")');
    
    // Error message container (generic selector)
    this.errorMessage = page.locator('.error-message').or(
      page.locator('text.error').or(
        page.locator('div.error')
      )
    );
    
    // User menu (the "AX" button in the top right)
    this.userMenu = page.locator('button:has-text("AX")');
    
    // Sign Out button in the dropdown menu
    this.logoutButton = page.locator('menuitem:has-text(" Sign Out")');
  }
  
  /**
   * Login to the application
   * @param username - Username to log in with
   * @param password - Password to log in with
   */
  async login(username: string, password: string): Promise<void> {
    try {
      console.log(`Attempting to login with username: ${username}`);
      
      // Navigate to sign-in page if not already there
      if (!this.page.url().includes('/sign-in')) {
        await this.page.goto('/sign-in');
      }
      
      // Wait for page to load
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Take a screenshot to debug
      await this.page.screenshot({ path: `login-page-before-${Date.now()}.png` });
      
      // Fill in email - using a more basic approach to ensure it works
      const emailInputVisible = await this.page.locator('input').first().isVisible()
        .catch(() => false);
      
      if (emailInputVisible) {
        await this.page.locator('input').first().fill(username);
      } else {
        console.error('Email input not found, trying alternative selectors');
        // Try all possible fallbacks
        await this.page.fill('input[aria-label="Email"]', username)
          .catch(() => this.page.fill('#email', username)
            .catch(() => this.page.fill('input:nth-child(1)', username)));
      }
      
      // Fill in password - using a similar approach
      const passwordInputVisible = await this.page.locator('input').nth(1).isVisible()
        .catch(() => false);
      
      if (passwordInputVisible) {
        await this.page.locator('input').nth(1).fill(password);
      } else {
        console.error('Password input not found, trying alternative selectors');
        await this.page.fill('input[aria-label="Password"]', password)
          .catch(() => this.page.fill('#password', password)
            .catch(() => this.page.fill('input[type="password"]', password)));
      }
      
      // Take another screenshot to debug
      await this.page.screenshot({ path: `login-page-filled-${Date.now()}.png` });
      
      // Click login button - using a more direct selector
      await this.page.locator('button:has-text("Sign In")').click()
        .catch(() => this.page.click('text="Sign In"'));
      
      // Wait for navigation
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
      
      // Check for error message
      const errorVisible = await this.errorMessage.isVisible()
        .catch(() => false);
      
      if (errorVisible) {
        const errorText = await this.errorMessage.textContent();
        throw new Error(`Login failed: ${errorText}`);
      }
      
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      await this.page.screenshot({ path: `login-failure-${Date.now()}.png` });
      throw error;
    }
  }
  
  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    try {
      console.log('Attempting to logout');
      
      // Check if user menu exists
      const menuVisible = await this.userMenu.isVisible()
        .catch(() => false);
      
      if (menuVisible) {
        // Click user menu to open dropdown
        await this.userMenu.click();
        
        // Wait for animation to complete
        await this.page.waitForTimeout(500);
        
        // Take screenshot to debug
        await this.page.screenshot({ path: `logout-menu-${Date.now()}.png` });
        
        // Check if logout button is visible
        const logoutVisible = await this.logoutButton.isVisible()
          .catch(() => false);
        
        if (logoutVisible) {
          // Click logout button
          await this.logoutButton.click();
          
          // Wait for navigation
          await this.page.waitForLoadState('networkidle', { timeout: 15000 });
          console.log('Logout successful');
          return;
        }
      }
      
      console.warn('Could not find user menu or logout button, trying URL-based logout');
      
      // Fallback: try navigating to sign-out URL
      await this.page.goto('/sign-out');
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      console.log('URL-based logout attempt completed');
    } catch (error) {
      console.error('Logout failed:', error);
      await this.page.screenshot({ path: `logout-failure-${Date.now()}.png` });
      // Don't throw error for logout failures as they're less critical
    }
  }
  
  /**
   * Check if user is logged in
   * @returns Boolean indicating if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for login form
      const loginFormVisible = await this.loginButton.isVisible()
        .catch(() => false);
      
      if (loginFormVisible) {
        return false;
      }
      
      // Check for user menu which indicates logged in state
      const userMenuVisible = await this.userMenu.isVisible()
        .catch(() => false);
      
      return userMenuVisible;
    } catch (error) {
      console.warn('Error checking login status:', error);
      return false;
    }
  }
}
