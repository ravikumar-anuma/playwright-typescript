import { expect, Locator, Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { LoginData } from '../testdata/LoginData';
import { CheckoutData } from '../testdata/CheckoutData';  

export class InventoryPage {

    private page: Page;
    private cartIcon : Locator;
    private AddToCartButton : Locator;
    private RemoveFromCartButton : Locator;
    private title : Locator;
    public productItems : Locator;
    public cartBadge : Locator;
    private checkoutButton : Locator;
    private FirstNameInput : Locator;
    private LastNameInput : Locator;
    private PostalCodeInput : Locator;
    private continueButton : Locator;
    private finishButton : Locator;
    private orderCompleteMessage : Locator;
    private menuButton : Locator;
    private logoutButton : Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.AddToCartButton = this.page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.RemoveFromCartButton = this.page.locator('[data-test="remove-sauce-labs-backpack"]');
    this.title = this.page.locator('.title');
    this.productItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.FirstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.LastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.PostalCodeInput = page.getByRole('textbox', { name: 'Postal Code' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.orderCompleteMessage = page.getByRole('heading', { name: 'Thank you for your order!' });
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutButton = page.locator('#logout_sidebar_link');

  }

  public async addFirstProduct() {
    await this.AddToCartButton.click();
    console.log('Add to Cart functionality works correctly.');

  }

  public async removeProduct() {
    await this.RemoveFromCartButton.click();
    console.log('Remove from Cart functionality works correctly.');
  }
  public async fillShippingInformation() {
    // Fill in shipping information
    await this.cartBadge.click();
    await this.checkoutButton.click();

    await this.FirstNameInput.fill(CheckoutData.firstName);
    await this.LastNameInput.fill(CheckoutData.lastName);
    await this.PostalCodeInput.fill(CheckoutData.postalCode);
    await this.continueButton.click();
    await this.finishButton.click();
    await expect(this.orderCompleteMessage).toHaveText(CheckoutData.ShoppingCart.SUCCESS_MESSAGE);
    console.log('Fill Shipping Information functionality works correctly.');
  
  }


  public async logout() {
    await this.menuButton.click();
    await this.logoutButton.click();
    console.log('Logout Successful.');

  }

}