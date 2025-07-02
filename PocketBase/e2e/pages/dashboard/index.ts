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

  async clickAddNew() {
    await this.frame.getByRole('button', { name: 'New record' }).click();
  }

  /**
   * Verifies that a toast message with the specified text is visible on the page.
   *
   * @param message - The text of the toast message to verify.
   */
  async verifyToastMessage(message: string) {
    const toastMessage = this.frame.getByText(message);
    await expect(toastMessage).toBeVisible();
  }
}
