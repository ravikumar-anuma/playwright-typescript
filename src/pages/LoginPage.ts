
import { expect, Locator, Page } from '@playwright/test';
import { LoginData } from '../testdata/LoginData';

export class LoginPage {
  private page: Page;
  private userName: Locator;
  private password: Locator;
  private loginButton: Locator;
  private swagLabsText: Locator;


  constructor(page: Page) {
    this.page = page;
    this.userName = page.locator('#user-name');
    this.password = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.swagLabsText = page.locator('.app_logo');
  }

  async navigate() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string) {
    await this.userName.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
    await this.page.waitForTimeout(3000);
  }
  async verifySwagLabsText() {
    await expect(this.swagLabsText).toHaveText('Swag Labs');
  }
}
