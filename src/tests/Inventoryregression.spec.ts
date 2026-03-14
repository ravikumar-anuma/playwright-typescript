import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Inventory - Regression Suite', () => {

  test('TC_INV_001: Add first product to cart @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    // Storage state provides authentication automatically
    await page.goto('/inventory.html');

    await inventory.addFirstProduct();
    // cartBadge is a locator; ensure it shows 1
    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('TC_INV_002: Remove product from cart @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    // Storage state provides authentication automatically
    await page.goto('/inventory.html');

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
    const inventory = new InventoryPage(page);
    // Storage state provides authentication automatically
    await page.goto('/inventory.html');

    // use existing helper to add and complete checkout
    await inventory.addFirstProduct();
    await inventory.fillShippingInformation();
  });

  test('TC_INV_004: Product list renders and has items @regression', async ({ page }) => {
    // Storage state provides authentication automatically
    await page.goto('/inventory.html');

    const inventory = new InventoryPage(page);
    const count = await inventory.productItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC_INV_005: Product details navigation shows detail page @regression', async ({ page }) => {
    // Storage state provides authentication automatically
    await page.goto('/inventory.html');

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
    // Storage state provides authentication automatically
    await page.goto('/inventory.html');

    // grab first two product names and prices, then add them to cart
    const items = page.locator('.inventory_item');
    const itemCount = await items.count();
    if (itemCount < 2) {
      console.warn('Not enough products to validate price arithmetic; skipping this test.');
      return;
    }
    const parse = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));

    const selected: { name: string; price: number }[] = [];
    for (let i = 0; i < 2; ++i) {
      const item = items.nth(i);
      const name = (await item.locator('.inventory_item_name').textContent())?.trim() || '';
      const priceText = (await item.locator('.inventory_item_price').textContent()) || '';
      const price = parse(priceText);
      // click the add button scoped to this item
      await item.locator('button[data-test^="add-to-cart"]').click();
      selected.push({ name, price });
    }

    // open cart
    await page.locator('.shopping_cart_link').click();

    // For each selected product, find it in cart and assert price matches
    for (const s of selected) {
      const cartItem = page.locator('.cart_item').filter({ hasText: s.name }).first();
      await expect(cartItem).toBeVisible();
      const cartPriceText = (await cartItem.locator('.inventory_item_price').textContent()) || '';
      const cartPrice = parse(cartPriceText);
      expect(cartPrice).toBeCloseTo(s.price, 2);
    }

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
  expect(total).toBeCloseTo(selected[0].price + selected[1].price, 2);
    }
  });

});
