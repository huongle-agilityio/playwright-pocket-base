import { expect } from '@playwright/test';
import { Form } from './components/form';

// Constants
import { BASE_URL } from '@/constants';

export class LoginPage {
  readonly page;
  readonly form;

  constructor(page) {
    this.page = page;
    this.form = new Form(this.page.frameLocator('iframe'));
  }

  private get frame() {
    return this.page.frameLocator('iframe');
  }

  async goto() {
    await this.page.goto(BASE_URL);
  }

  /**
   * Verifies that the login page is loaded and the Superuser login heading is visible.
   */
  async verifyLoginLoaded() {
    const loginText = this.frame.getByRole('heading', { name: 'Superuser login' });
    await expect(loginText).toBeVisible();
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
