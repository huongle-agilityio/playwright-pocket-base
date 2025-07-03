import * as path from 'path';
import { expect } from '@playwright/test';

// Interfaces
import { User } from '@/interfaces';

export class UserForm {
  readonly page;
  readonly title;
  readonly id;
  readonly email;
  readonly password;
  readonly passwordConfirm;
  readonly isVerified;
  readonly username;
  readonly name;
  readonly avatar;
  readonly website;
  readonly buttonSubmit;
  readonly buttonCancel;

  constructor(page) {
    this.page = page.frameLocator('iframe').locator('.overlay-panel-container');
    this.id = this.page.getByLabel('id');
    this.email = this.page.getByRole('textbox', { name: ' email *' });
    this.password = this.page.getByRole('textbox', { name: 'Password *' });
    this.passwordConfirm = this.page.getByRole('textbox', { name: 'Password confirm *' });
    this.isVerified = this.page.getByText('Verified');
    this.username = this.page.getByLabel('username');
    this.name = this.page.getByRole('textbox', { name: ' name' });
    this.avatar = this.page.getByRole('button', { name: 'Upload new file' });
    this.website = this.page.getByRole('textbox', { name: 'website' });
    this.buttonSubmit = this.page.getByRole('button', { name: 'Create' });
    this.buttonCancel = this.page.getByRole('button', { name: 'Cancel' });
  }

  async verifyTitle(message) {
    const title = this.page.getByRole('heading', { name: message });
    await expect(title).toBeVisible();
  }

  async submit() {
    await this.buttonSubmit.click();
  }

  async saveChange() {
    await this.page.getByRole('button', { name: 'Save changes' }).click();
  }

  async saveAndContinue() {
    await this.page.locator('.btn.p-l-5').click();
    await this.page.getByRole('menuitem', { name: 'Save and continue' }).click();
  }

  async cancel() {
    await this.buttonCancel.click();
  }

  /**
   * Uploads an avatar image to the form.
   *
   * @param file - The name of the file to upload. The file should be located in the `assets/images` directory.
   */
  async uploadAvatar(file: string) {
    const filePath = path.join(__dirname, `../../assets/images/${file}`);
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await expect(this.page.locator('.filename .txt')).toHaveText(file);
  }

  /**
   * Fills the form fields with the provided user data.
   *
   * @param user - An object of type User containing the user's information.
   */
  async fillForm(user: User) {
    if (user.id) await this.id.fill(user.id);
    if (user.email) await this.email.fill(user.email);
    if (user.password) await this.password.fill(user.password);
    if (user.passwordConfirm) await this.passwordConfirm.fill(user.passwordConfirm);
    if (user.isVerified) await this.isVerified.click();
    if (user.avatar) await this.uploadAvatar(user.avatar);
    if (user.username) await this.username.fill(user.username);
    if (user.name) await this.name.fill(user.name);
    if (user.website) await this.website.fill(user.website);

    await this.submit();
  }

  /**
   * Verifies that an error message with the specified text is visible on the page.
   *
   * @param message - The text of the error message to verify.
   */
  async verifyErrorMessage(message: string | RegExp) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
