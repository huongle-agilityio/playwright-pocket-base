import { test as base, expect } from '@playwright/test';
import { DashboardPage, LoginPage } from '../pages';

interface PagesFixture {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}

const test = base.extend<PagesFixture>({
  loginPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await use(login);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { test, expect };
