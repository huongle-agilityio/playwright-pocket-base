export class GoogleOAuthPage {
  readonly page;
  readonly email;
  readonly emailNext;
  readonly password;
  readonly passwordNext;
  readonly code;
  readonly totpNext;

  constructor(page) {
    this.page = page;
    this.email = this.page.getByRole('textbox', { name: 'Email or phone' });
    this.emailNext = this.page.getByRole('button', { name: 'Next' });
    this.password = this.page.getByRole('textbox', { name: 'Enter your password' });
    this.passwordNext = this.page.locator('#passwordNext').getByRole('button', { name: 'Next' });
    this.code = this.page.getByLabel('Enter code');
    this.totpNext = this.page.locator('#totpNext').getByRole('button', { name: 'Next' });
  }

  /**
   * Logs in using the provided email and password.
   *
   * @param email - The email address to fill in the login form.
   * @param password - The password to fill in the login form.
   */
  async login(email: string, password: string) {
    await this.email.click();
    await this.email.fill(email);
    await this.emailNext.click();
    await this.password.fill(password);
    await this.passwordNext.click();
  }

  /**
   * Enters the provided code and submits the form.
   *
   * @param code - The code to enter in the Google 2-Step Verification form.
   */
  async enterCode(code: string) {
    await this.code.fill(code);
    await this.totpNext.click();
  }
}
