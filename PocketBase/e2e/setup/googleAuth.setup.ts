import * as path from 'path';
import { test } from '@/fixtures';

// Constants
import { USER } from '@/constants';

// Utils
import { generateOTP } from '@/utils';

const authFile = path.join(__dirname, '../.auth/google-user.json');
test('authenticated with Google account', async ({ page, googleLoginPage, googleOAuthPage }) => {
  await googleLoginPage.goto();

  // Navigate to Google login
  await googleLoginPage.loginWithGoogle();
  await page.waitForURL(/accounts\.google\.com/);

  // Login with Google credentials
  await googleOAuthPage.login(USER.GOOGLE_EMAIL, USER.GOOGLE_PASSWORD);

  // Enter 2FA code
  const twoFACode = generateOTP(USER.GOOGLE_OTP_SECRET);
  await googleOAuthPage.enterCode(twoFACode);

  // Save auth state
  await page.context().storageState({ path: authFile });
});
