import { expect } from '@playwright/test';

export class DashboardPage {
  readonly page;

  constructor(page) {
    this.page = page;
  }

  private get frame() {
    return this.page.frameLocator('iframe');
  }

  async goto() {
    await this.page.goto('');
    await this.frame.getByRole('link', { name: 'Collections' }).click();
    await this.frame.getByRole('link', { name: 'users' }).click();
  }

  /**
   * Verifies that the login page is loaded and the Superuser login heading is visible.
   */
  async verifyDashboardLoaded() {
    const dashboard = this.frame.getByRole('main').getByText('users', { exact: true });
    await expect(dashboard).toBeVisible();
  }

  async logout() {
    await this.frame.getByRole('button', { name: 'Logged superuser menu' }).click();
    await this.frame.getByRole('menuitem', { name: 'Logout' }).click();
  }
}
