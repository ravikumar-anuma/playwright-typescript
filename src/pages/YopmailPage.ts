import { expect, Locator, Page } from '@playwright/test';

export class YopmailPage {
  private page: Page;
  private emailInput: Locator;
  private arrowButton: Locator;
  private activateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="login"]');
    this.arrowButton = page.getByTitle('Check Inbox @yopmail.com');
    this.activateButton = page.locator('iframe[name="ifmail"]').contentFrame().getByRole('link', { name: 'Activate User Profile' });
  }

  async navigate() {
    await this.page.goto('https://yopmail.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async clickArrow() {
    await this.arrowButton.click();
    // Wait for the inbox to load
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickActivateUserProfile() {
    // Set up route handling to abort tracking requests
    await this.page.route('**://click.sendgrid.net/**', async (route) => {
      await route.abort();
    });

    // Handle popup/new page
    let newPageUrl = '';
    const pagePromise = this.page.context().waitForEvent('page');

    // Click the activate link
    await this.activateButton.click();

    // Wait for new page to open
    try {
      const newPage = await Promise.race([
        pagePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('No new page opened')), 5000)
        )
      ]) as any;
      
      newPageUrl = newPage.url();
      console.log('New page opened:', newPageUrl);
      await newPage.waitForLoadState('networkidle');
      await newPage.close();
    } catch (error) {
      console.log('No popup detected, continuing with current page');
    }

    // Wait for heavy redirect
    await this.page.waitForTimeout(20000);

    console.log('Final URL:', this.page.url());
  }

  async getActivationLink(): Promise<string> {
    // Get the activation link from the email
    const frameLocator = this.page.frameLocator('iframe');
    const link = frameLocator.locator('a[href*="activate"]').first();
    const href = await link.getAttribute('href');
    return href || '';
  }

  async switchToActivationEmail() {
    // Wait for email to appear and switch to it
    await this.page.waitForTimeout(2000);
    const emailRow = this.page.locator('[data-test-id="email-row"]').first();
    await emailRow.click();
  }
};
