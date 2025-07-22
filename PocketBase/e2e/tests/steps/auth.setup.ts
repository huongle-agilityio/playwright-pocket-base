import * as path from 'path';

// Fixtures
import { Then, When } from '@/fixtures/authFixtures';

// Constants
import { USER } from '@/constants';

const authFile = path.join(__dirname, '../../.auth/user.json');

When('I log in with valid credentials', async ({ loginPage }) => {
  await loginPage.form.loginAs(USER.USER_NAME, USER.PASSWORD);
});

Then('I should be redirected to the dashboard', async ({ dashboardPage }) => {
  await dashboardPage.verifyDashboardLoaded();
});

Then('I save the current auth state', async ({ page }) => {
  await page.context().storageState({ path: authFile });
});
