import { test, expect } from '@playwright/test';
import { YopmailPage } from '../pages/YopmailPage';

test.describe('Yopmail Email Verification', () => {
  let yopmailPage: YopmailPage;

  test.beforeEach(async ({ page }) => {
    yopmailPage = new YopmailPage(page);
    // Storage state provides authentication automatically
  });

  test('Activate user profile via yopmail @smoke', async ({ page }) => {
    await test.step('Navigate to yopmail', async () => {
      await yopmailPage.navigate();
    });

    await test.step('Enter test email address', async () => {
      await yopmailPage.enterEmail('testaccountINT1771645806088@yopmail.com');
    });

    await test.step('Click arrow to access inbox', async () => {
      await yopmailPage.clickArrow();
    });

    // await test.step('Switch to activation email', async () => {
    //   await yopmailPage.switchToActivationEmail();
    // });

    await test.step('Click activate user profile', async () => {
      await yopmailPage.clickActivateUserProfile();
    });

    await test.step('Verify activation page opened', async () => {
      // Verify that the page navigated to activation page
      await expect(page).toHaveURL(/activate/);
    });
  });

  test('Get activation link from email @smoke', async ({ page }) => {
    await test.step('Navigate to yopmail', async () => {
      await yopmailPage.navigate();
    });

    await test.step('Enter test email address', async () => {
      await yopmailPage.enterEmail('testaccountINT1771645806088@yopmail.com');
    });

    await test.step('Click arrow to access inbox', async () => {
      await yopmailPage.clickArrow();
    });

    await test.step('Switch to activation email', async () => {
      await yopmailPage.clickActivateUserProfile();
    });

    
  });
});
