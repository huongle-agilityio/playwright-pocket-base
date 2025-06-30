import { Locator } from '@playwright/test';

export class Form {
  readonly email;
  readonly password;

  constructor(readonly root: Locator) {
    this.root = root;
    this.email = root.getByRole('textbox', { name: 'Email *' });
    this.password = root.getByRole('textbox', { name: 'Password *' });
  }

  /**
   * Fills the email field in the login form with the provided email address.
   *
   * @param email - The email address to fill in the login form.
   */
  async fillEmail(email: string) {
    await this.email.fill(email);
  }

  /**
   * Fills the password field in the login form with the provided password.
   *
   * @param password - The password to fill in the login form.
   */
  async fillPassword(password: string) {
    await this.password.fill(password);
  }

  async submit() {
    await this.root.getByRole('button', { name: 'Login' }).click();
  }

  /**
   * Clears the email and password fields in the login form.
   */
  async reset() {
    await this.email.fill('');
    await this.password.fill('');
  }

  /**
   * Logs in using the provided email and password.
   *
   * @param email - The email address to fill in the login form.
   * @param password - The password to fill in the login form.
   */
  async loginAs(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
