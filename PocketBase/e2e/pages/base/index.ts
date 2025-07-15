import { expect } from '@playwright/test';

export class BasePage {
  readonly page;

  constructor(page) {
    this.page = page;
  }

  get frame() {
    return this.page.frameLocator('iframe');
  }

  /**
   * Verifies that a toast message with the specified text is visible on the page.
   *
   * @param message - The text of the toast message to verify.
   */
  async verifyToastMessage(message: string) {
    const toastMessage = this.frame.getByText(message);
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
  }
}
