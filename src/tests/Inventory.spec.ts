import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';


test.beforeEach(async ({ page }) => {
  // Navigate to inventory page - storage state provides authentication automatically
  await page.goto('https://www.saucedemo.com/inventory.html');
});

test('TC_INV_001: Verify Add to cart the Item @smoke @regression', async ({ page }) => {
  const inventory = new InventoryPage(page);
  await test.step('Verify Add to Cart Item functionality', async () => {
    await inventory.addFirstProduct(); 
    await expect(inventory.cartBadge).toHaveText('1'); 
  });
  await test.step('Verify Checkout and Fill the Shipping address Information', async () => {
    await inventory.fillShippingInformation();
  });
});

test('TC_INV_002: Verify Item Remove from cart @smoke @regression', async ({ page }) => {
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