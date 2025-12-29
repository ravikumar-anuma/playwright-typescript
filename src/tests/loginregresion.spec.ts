import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginData } from '../testdata/LoginData';

// Regression tests for Login functionality

test.describe('Login - Regression tests', () => {

  test('TC_LOGIN_003: Invalid credentials should show error @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(LoginData.InvalidCredentials.username, LoginData.InvalidCredentials.password);
    await loginPage.isErrorDisplayed();
  });

  test('TC_LOGIN_004: Empty fields validation shows error @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    // attempt login with empty username and password
    await loginPage.login('', '');
    await loginPage.isErrorDisplayed();
  });

  test('TC_LOGIN_008: Locked account displays locked message @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    // Use known locked_out_user from Saucedemo
    await loginPage.login('locked_out_user', 'secret_sauce');
    await loginPage.isErrorDisplayed();
  });

  test('TC_LOGIN_013: Injection attempts do not bypass authentication @regression @security', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    const payloads = ["' OR '1'='1' --", "<script>alert(1)</script>"];
    for (const p of payloads) {
      await loginPage.login(p, p);
      await loginPage.isErrorDisplayed();
    }
  });

  test('TC_LOGIN_005: Email format validation (if applicable) @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    // Saucedemo accepts any string as username, but we still assert behavior: invalid credentials show error
    await loginPage.login('not-an-email', 'somepassword');
    await loginPage.isErrorDisplayed();
  });

});
