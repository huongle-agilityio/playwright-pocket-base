import { test as base, expect } from '@playwright/test';
import { DashboardPage, LoginPage, UserForm, UserTable } from '../pages';

interface PagesFixture {
  userForm: UserForm;
  loginPage: LoginPage;
  userTable: UserTable;
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

  userTable: async ({ page }, use) => {
    const userTable = new UserTable(page);
    await use(userTable);
  },

  userForm: async ({ page }, use) => {
    const form = new UserForm(page);
    await use(form);
  },
});

export { test, expect };
