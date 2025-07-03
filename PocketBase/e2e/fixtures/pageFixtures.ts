import { test as base, expect } from '@playwright/test';
import { DashboardPage, LoginPage, UserForm, TablePage } from '../pages';

interface PagesFixture {
  userForm: UserForm;
  loginPage: LoginPage;
  tablePage: TablePage;
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

  tablePage: async ({ page }, use) => {
    const tablePage = new TablePage(page);
    await use(tablePage);
  },

  userForm: async ({ page }, use) => {
    const form = new UserForm(page);
    await use(form);
  },
});

export { test, expect };
