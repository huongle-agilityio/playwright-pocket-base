import { expect } from '@playwright/test';
import { BasePage } from '../base';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
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

  /**
   * Deletes the selected item(s) in the table.
   *
   * This method first verifies that the "Delete selected" button is visible, then clicks it.
   * The method does not verify that the item(s) are actually deleted from the table.
   */
  async deleteSelected() {
    const button = this.frame.getByRole('button', { name: 'Delete selected' });
    await expect(button).toBeVisible();
    await button.click();
  }

  /**
   * Resets the selected item(s) in the table.
   *
   * This method first verifies that the "Reset" button is visible, then clicks it.
   * The method does not verify that the item(s) are actually reset in the table.
   */
  async resetSelected() {
    const button = this.frame.getByRole('button', { name: 'Reset' });
    await expect(button).toBeVisible();
    await button.click();
  }

  async logout() {
    await this.frame.getByRole('button', { name: 'Logged superuser menu' }).click();
    await this.frame.getByRole('menuitem', { name: 'Logout' }).click();
  }

  async clickAddNew() {
    await this.frame.locator('header').getByRole('button', { name: 'New record' }).click();
  }

  /**
   * Submits the confirm modal by clicking the "Yes" button.
   *
   * @remarks
   * This method is intended to be used when the user has been presented with a
   * confirm modal and wants to confirm the action. The method does not verify
   * that the modal is actually visible before clicking the button.
   */
  async submitConfirmModal() {
    await this.frame.getByRole('button', { name: 'Yes' }).click();
  }

  /**
   * Cancels the confirm modal by clicking the "No" button.
   *
   * @remarks
   * This method is intended to be used when the user has been presented with a
   * confirm modal and wants to cancel the action. The method does not verify
   * that the modal is actually visible before clicking the button.
   */
  async cancelConfirmModal() {
    await this.frame.getByRole('button', { name: 'No' }).click();
  }

  /**
   * Verifies that the text on the page indicates that the specified number of
   * records are selected.
   *
   * @param number - The number of records that should be selected.
   */
  verifyNumberOfRecordsSelected(number: number) {
    return this.frame.getByText(`Selected ${number} ${number > 1 ? 'records' : 'record'}`);
  }
}
