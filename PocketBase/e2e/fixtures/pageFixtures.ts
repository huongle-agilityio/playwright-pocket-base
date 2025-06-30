import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages';

interface PagesFixture {
  loginPage: LoginPage;
}

const test = base.extend<PagesFixture>({
  loginPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await use(login);
  },
});

export { test, expect };
