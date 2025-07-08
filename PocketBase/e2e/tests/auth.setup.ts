import * as path from 'path';
import { test } from '@/fixtures';

// Constants
import { USER } from '@/constants';

const authFile = path.join(__dirname, '../.auth/user.json');
test(
  'authenticated',
  {
    tag: '@setup',
  },
  async ({ page, loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.form.loginAs(USER.USER_NAME, USER.PASSWORD);

    await dashboardPage.verifyDashboardLoaded();

    // Save auth state
    await page.context().storageState({ path: authFile });
  },
);
