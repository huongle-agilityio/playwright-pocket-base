import { expect } from '@playwright/test';
import { LoginForm } from './components/form';
import { BasePage } from '../base';

export class LoginPage extends BasePage {
  readonly form;

  constructor(page) {
    super(page);
    this.form = new LoginForm(this.page.frameLocator('iframe'));
  }

  async goto() {
    await this.page.goto('');
  }

  /**
   * Verifies that the login page is loaded and the Superuser login heading is visible.
   */
  async verifyLoginLoaded() {
    const loginText = this.frame.getByRole('heading', { name: 'Superuser login' });
    await expect(loginText).toBeVisible();
  }
}
