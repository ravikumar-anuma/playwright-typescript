import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginData } from '../testdata/LoginData';
import path from 'path';

const AUTH_FILE = path.join('playwright', '.auth', 'user.json');

test('Authenticate and save storage state', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await test.step('Navigate to login page', async () => {
    await loginPage.navigate();
  });

  await test.step('Login with valid credentials', async () => {
    await loginPage.login(LoginData.username, LoginData.password);
  });

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
});
