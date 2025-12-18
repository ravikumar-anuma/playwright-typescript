
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginData } from '../testdata/LoginData';
import { InventoryPage } from '../pages/InventoryPage';

test('Sauce login test', async ({ page }) => {

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

test('DashBoard View test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await test.step('Login to application', async () => {
    await loginPage.navigate();
    await loginPage.login(LoginData.username, LoginData.password);
  });
  await test.step('Verify Swag Labs text', async () => {
    await loginPage.verifySwagLabsText();
  });
});
