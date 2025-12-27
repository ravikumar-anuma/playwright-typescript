import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  private page: Page;
  private searchBox: Locator;
  private searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator('#search_query_top');
    this.searchButton = page.locator('button[name="submit_search"]');
  }

  async navigate() {
    await this.page.goto('http://www.automationpractice.pl/index.php');
  }

  async searchForItem(item: string) {
    await this.searchBox.fill(item);
    await this.searchButton.click();
  }
}

export class SearchResultsPage {
  private page: Page;
  private results: Locator;

  constructor(page: Page) {
    this.page = page;
    this.results = page.locator('.product_list .product-name');
  }

  async verifyItemInResults(item: string) {
    const items = await this.results.allTextContents();
    expect(items).toContain(item);
  }
}