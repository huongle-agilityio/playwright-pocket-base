import * as path from 'path';

// Fixtures
import { Given, Then, When } from '@/fixtures/authFixtures';

// Constants
import { USER } from '@/constants';

// Utils
import { generateOTP } from '@/utils';

const authFile = path.join(__dirname, '../../.auth/google-user.json');

let twoFACode: string;

Given('I am on the Google login page', async ({ page, googleLoginPage }) => {
  await googleLoginPage.goto();
  await googleLoginPage.loginWithGoogle();
  await page.waitForURL(/accounts\.google\.com/);
});

When('I log in using Google email and password', async ({ googleOAuthPage }) => {
  await googleOAuthPage.login(USER.GOOGLE_EMAIL, USER.GOOGLE_PASSWORD);
});

When('I enter the 2FA code', async ({ googleOAuthPage }) => {
  twoFACode = generateOTP(USER.GOOGLE_OTP_SECRET);
  await googleOAuthPage.enterCode(twoFACode);
});

Then('my session should be saved', async ({ page }) => {
  await page.context().storageState({ path: authFile });
});
