import { Page, Locator } from '@playwright/test';

export class HomePage {
  private page: Page;
  private searchBox: Locator;
  private searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.getByRole('textbox', { name: 'Search' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  async navigate() {
    await this.page.goto('http://www.automationpractice.pl/index.php');
  }

  async searchForProduct(product: string) {
    await this.searchBox.fill(product);
    await this.searchButton.click();
  }
}