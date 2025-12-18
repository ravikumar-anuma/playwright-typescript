import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginData } from '../testdata/LoginData';
import { LoginPage } from '../pages/LoginPage';


test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(LoginData.username, LoginData.password);
});

test('TC_INV_001: Verify Add to cart the Item', async ({ page }) => {
  const inventory = new InventoryPage(page);
  await test.step('Verify Add to Cart Item functionality', async () => {
    await inventory.addFirstProduct(); 
    await expect(inventory.cartBadge).toHaveText('1'); 
  });
  await test.step('Verify Checkout and Fill the Shipping address Information', async () => {
    await inventory.fillShippingInformation();
  });
});

test('TC_INV_002: Verify Item Remove from cart', async ({ page }) => {
  const inventory = new InventoryPage(page);

   await test.step('Verify Add to Cart Item functionality', async () => {
    await inventory.addFirstProduct(); 
    await expect(inventory.cartBadge).toHaveText('1'); 
  });
  
  await test.step('Verify Item Remove from Cart functionality', async () => {
    await inventory.removeProduct(); 
    await expect(inventory.cartBadge).toHaveCount(0);
  });

  await test.step('Logout from application', async () => {
    await inventory.logout(); 
  });
  
});