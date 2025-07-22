import { test as base } from 'playwright-bdd';
import { APIRequestContext } from '@playwright/test';

// Pages
import { DashboardPage, LoginPage } from '../pages';

// Constants
import { BASE_URL } from '@/constants';

// Utils
import { extractAccessToken } from '@/utils';

interface PagesFixture {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  apiContext: APIRequestContext;
}

const test = base.extend<PagesFixture>({
  apiContext: async ({ playwright }, use) => {
    const token = extractAccessToken();
    const context = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    await use(context);
    await context.dispose(); // Auto cleanup after test
  },

  loginPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await use(login);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { test };
