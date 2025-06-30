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

  async goto() {
    await this.page.goto(BASE_URL);
  }

  /**
   * Verifies that the login page is loaded and the Superuser login heading is visible.
   */
  async verifyLoginLoaded() {
    const frameHandle = await this.page.frameLocator('iframe');
    const loginText = frameHandle.getByRole('heading', { name: 'Superuser login' });
    await expect(loginText).toBeVisible();
  }
}
