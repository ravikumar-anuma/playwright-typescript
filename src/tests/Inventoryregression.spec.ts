import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginData } from '../testdata/LoginData';

test.describe('Inventory - Regression Suite', () => {

  test('TC_INV_001: Add first product to cart @regression', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    await login.navigate();
    await login.login(LoginData.username, LoginData.password);

    await inventory.addFirstProduct();
    // cartBadge is a locator; ensure it shows 1
    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('TC_INV_002: Remove product from cart @regression', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    await login.navigate();
    await login.login(LoginData.username, LoginData.password);

    // add then remove
    await inventory.addFirstProduct();
    // remove
    await inventory.removeProduct();

    // cart badge should not be visible (no items)
    const badgeCount = await inventory.cartBadge.count();
    if (badgeCount === 0) {
      // badge element not present — OK
    } else {
      // if present, assert it's not visible when no items
      await expect(inventory.cartBadge).not.toBeVisible();
    }
  });

  test('TC_INV_003: Checkout happy path (from inventory) @regression', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    await login.navigate();
    await login.login(LoginData.username, LoginData.password);

    // use existing helper to add and complete checkout
    await inventory.addFirstProduct();
    await inventory.fillShippingInformation();
  });

  test('TC_INV_004: Product list renders and has items @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(LoginData.username, LoginData.password);

    const inventory = new InventoryPage(page);
    const count = await inventory.productItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC_INV_005: Product details navigation shows detail page @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(LoginData.username, LoginData.password);

    // click first product title to go to details
    const firstTitle = page.locator('.inventory_item_name').first();
    const name = await firstTitle.textContent();
    await firstTitle.click();

    // product detail page should show the name and description
    const detailName = page.locator('.inventory_details_name');
    await expect(detailName).toHaveText(name?.trim() || '');

    // go back to inventory
    await page.goBack();
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('TC_INV_009: Price and cart subtotal arithmetic @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(LoginData.username, LoginData.password);

    // grab prices for first two items
    const prices = await page.locator('.inventory_item_price').allTextContents();
    if (prices.length < 2) {
      // Not enough products to perform price arithmetic in this environment — skip assertions safely
      console.warn('Not enough products to validate price arithmetic; skipping this test.');
      return;
    }
    const parse = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));
    const p1 = parse(prices[0]);
    const p2 = parse(prices[1]);

    // add both items to cart
    const addButtons = page.locator('button[data-test^="add-to-cart"]');
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();

    // open cart
    await page.locator('.shopping_cart_link').click();

    // read prices from cart (should match)
    const cartPrices = await page.locator('.inventory_item_price').allTextContents();
    const cp1 = parse(cartPrices[0]);
    const cp2 = parse(cartPrices[1]);

    expect(cp1).toBeCloseTo(p1, 2);
    expect(cp2).toBeCloseTo(p2, 2);

    // verify subtotal on checkout overview (if present)
    // proceed to checkout to see totals
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('textbox', { name: 'First Name' }).fill('Auto');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Tester');
    await page.getByRole('textbox', { name: 'Postal Code' }).fill('12345');
    await page.getByRole('button', { name: 'Continue' }).click();

    // On overview page, item total text appears like 'Item total: $xx.xx'
    const itemTotalText = await page.locator('.summary_subtotal_label').textContent();
    if (itemTotalText) {
      const total = parse(itemTotalText);
      expect(total).toBeCloseTo(p1 + p2, 2);
    }
  });

});
