import { createBdd } from 'playwright-bdd';
import * as path from 'path';

// Fixtures
import { test as base, expect } from './pageFixtures';

// Pages
import { GoogleLoginPage, GoogleOAuthPage } from '../pages';

interface NoStorageFixture {
  skipSetup: void;
  googleLoginPage: GoogleLoginPage;
  googleOAuthPage: GoogleOAuthPage;
}

const test = base.extend<NoStorageFixture>({
  storageState: async ({ $tags }, use) => {
    const user_auth_storage_state = path.join(__dirname, '../.auth/user.json');

    if ($tags.includes('@noStorage')) {
      await use({ cookies: [], origins: [] });
    } else {
      await use(user_auth_storage_state);
    }
  },

  googleLoginPage: async ({ page }, use) => {
    const googleLoginPage = new GoogleLoginPage(page);
    await use(googleLoginPage);
  },

  googleOAuthPage: async ({ page }, use) => {
    const googleOAuthPage = new GoogleOAuthPage(page);
    await use(googleOAuthPage);
  },
});

export { expect, test };
export const { Given, When, Then } = createBdd(test);
