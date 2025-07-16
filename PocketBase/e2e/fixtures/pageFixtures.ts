import { APIRequestContext, test as base, expect } from '@playwright/test';
import { DashboardPage, GoogleLoginPage, GoogleOAuthPage, LoginPage } from '../pages';
import { UserForm, TablePage, SearchInput } from '../components';

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
  googleLoginPage: GoogleLoginPage;
  googleOAuthPage: GoogleOAuthPage;
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

  googleLoginPage: async ({ page }, use) => {
    const googleLoginPage = new GoogleLoginPage(page);
    await use(googleLoginPage);
  },

  googleOAuthPage: async ({ page }, use) => {
    const googleOAuthPage = new GoogleOAuthPage(page);
    await use(googleOAuthPage);
  },
});

export { test, expect };
