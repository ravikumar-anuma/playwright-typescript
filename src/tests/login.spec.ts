
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginData } from '../testdata/LoginData';
import { InventoryPage } from '../pages/InventoryPage';

test('Sauce login test @smoke @regression', async ({ page }) => {

  await test.step('Login to application', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(LoginData.username, LoginData.password);
  });
  
  await test.step('Verify Inventory Page URL', async () => {
    await expect(page).toHaveURL(/\/inventory\.html/);
  });

  await test.step('Logout from application', async () => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.logout();
  });
});

test('DashBoard View test @smoke @regression', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await test.step('Login to application', async () => {
    await loginPage.navigate();
    await loginPage.login(LoginData.InvalidCredentials.username, LoginData.InvalidCredentials.password);
  });
  await test.step('Verify Swag Labs Text Verification', async () => {
    await loginPage.verifySwagLabsText();
  });
});

test('Invalid Credentials test @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await test.step('Login to application', async () => {
    await loginPage.navigate();
    await loginPage.login(LoginData.InvalidCredentials.username, LoginData.InvalidCredentials.password);
  });
  await test.step('Verify Invalid Credentials Error Message', async () => {
    await loginPage.isErrorDisplayed();
  });
});