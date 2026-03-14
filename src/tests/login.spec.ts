
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginData } from '../testdata/LoginData';
import { InventoryPage } from '../pages/InventoryPage';

test('Verify Inventory Page URL with authenticated user @smoke @regression', async ({ page }) => {
  await test.step('Navigate to inventory page', async () => {
    await page.goto('/inventory.html');
  });
  
  await test.step('Verify Inventory Page URL', async () => {
    await expect(page).toHaveURL(/\/inventory\.html/);
  });

  await test.step('Logout from application', async () => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.logout();
  });
});

test('DashBoard View test with authenticated user @smoke @regression', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await test.step('Navigate to application', async () => {
    await loginPage.navigate();
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