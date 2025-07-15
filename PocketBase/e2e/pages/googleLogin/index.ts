import { URL_LOGIN_WITH_GOOGLE_AUTHENTICATION } from '@/constants';

export class GoogleLoginPage {
  readonly page;

  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(URL_LOGIN_WITH_GOOGLE_AUTHENTICATION);
  }

  async loginWithGoogle() {
    const button = await this.page.getByRole('button', { name: 'Continue with Google' });
    await button.click();
  }
}
