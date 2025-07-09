import { APIRequestContext, test as base, expect } from '@playwright/test';
import { DashboardPage, LoginPage, UserForm, TablePage, SearchInput } from '../pages';

// Constants
import { BASE_URL } from '@/constants';

// Utils
import { extractAccessToken } from '@/utils';

interface PagesFixture {
  userForm: UserForm;
  loginPage: LoginPage;
  tablePage: TablePage;
  dashboardPage: DashboardPage;
  searchInput: SearchInput;
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

  tablePage: async ({ page }, use) => {
    const tablePage = new TablePage(page);
    await use(tablePage);
  },

  userForm: async ({ page }, use) => {
    const form = new UserForm(page);
    await use(form);
  },

  searchInput: async ({ page }, use) => {
    const searchInput = new SearchInput(page);
    await use(searchInput);
  },
});

export { test, expect };
