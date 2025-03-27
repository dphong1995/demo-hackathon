import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object with common functionality and timeouts
 */
export class BasePage {
  protected page: Page;
  
  // Timeouts for different operations - can be adjusted for slow servers
  protected readonly navigationTimeout = 60000; // 60 seconds
  protected readonly elementTimeout = 30000;    // 30 seconds
  protected readonly actionTimeout = 15000;     // 15 seconds

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Take a screenshot with a timestamp for debugging
   * @param namePrefix - Prefix for the screenshot filename
   */
  async takeScreenshot(namePrefix: string): Promise<void> {
    await this.page.screenshot({ path: `${namePrefix}-${Date.now()}.png` });
  }

  /**
   * Wait for a specified time
   * @param ms - Milliseconds to wait
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Navigate to a URL with better error handling
   * @param url - URL to navigate to
   */
  async navigate(url: string): Promise<void> {
    try {
      await this.page.goto(url, {
        timeout: this.navigationTimeout,
        waitUntil: 'domcontentloaded' // Better for slow servers than 'load'
      });
      await this.wait(1000); // Small wait for stability
    } catch (error) {
      console.error(`Navigation to ${url} failed:`, error);
      await this.takeScreenshot('navigation-failed');
      throw error;
    }
  }
  
  /**
   * Check if an element is visible
   * @param locator - Element locator
   * @param timeout - Optional custom timeout
   * @returns Boolean indicating if element is visible
   */
  async isVisible(locator: Locator, timeout?: number): Promise<boolean> {
    return await locator.isVisible({ timeout: timeout || this.elementTimeout })
      .catch(() => false);
  }
}
